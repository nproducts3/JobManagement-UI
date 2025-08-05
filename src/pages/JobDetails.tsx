import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Building, Clock, Star, ArrowLeft, Share, Bookmark } from 'lucide-react';
import { GoogleJob } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<GoogleJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, role } = useAuth();
  const [similarJobs, setSimilarJobs] = useState<GoogleJob[]>([]);
  const navigate = useNavigate();
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobDetails(id);
    }
  }, [id]);

  useEffect(() => {
    if (job && job.id) {
      fetchSimilarJobs(job.id, job.title, job.companyName);
    }
  }, [job]);

  const fetchJobDetails = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/google-jobs/${id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      } else {
        // If specific job not found, get from the list
        const listResponse = await fetch('http://localhost:8080/api/google-jobs');
        if (listResponse.ok) {
          const jobs = await listResponse.json();
          const foundJob = jobs.find((j: GoogleJob) => j.id === id);
          if (foundJob) {
            setJob(foundJob);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch job details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSimilarJobs = async (jobId: string, title?: string, companyName?: string) => {
    try {
      // Fetch all jobs and filter for similar ones (by title or company, not the current job)
      const response = await fetch('http://localhost:8080/api/google-jobs?page=0&size=20');
      if (response.ok) {
        const data = await response.json();
        const jobsArray = Array.isArray(data.content) ? data.content : [];
        const filtered = jobsArray.filter(
          (j: GoogleJob) =>
            j.id !== jobId &&
            (j.title === title || j.companyName === companyName)
        );
        setSimilarJobs(filtered.slice(0, 3)); // Show top 3 similar jobs
      }
    } catch (error) {
      console.error('Failed to fetch similar jobs:', error);
    }
  };

  const handleApplyNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    let url: string | undefined;
    if (job?.applyLinks) {
      let links: string[] = [];
      if (typeof job.applyLinks === 'string') {
        try {
          const parsed = JSON.parse(job.applyLinks);
          if (Array.isArray(parsed)) {
            links = parsed;
          } else {
            links = [job.applyLinks];
          }
        } catch {
          links = [job.applyLinks];
        }
      } else if (Array.isArray(job.applyLinks)) {
        links = job.applyLinks;
      }
      url = links[0];
      if (url) {
        url = url.trim();
        if (!/^https?:\/\//i.test(url)) {
          url = 'https://' + url.replace(/^\/+/, '');
        }
        window.open(url, '_blank');
      } else {
        alert('No application link is available for this job.');
      }
    } else {
      alert('No application link is available for this job.');
    }
  };

  const getMatchData = () => ({
    overall: 95,
    skills: 90,
    experience: 85,
    education: 80
  });

  // Utility function to parse description/qualifications into nested lists with headings
  function parseDescriptionToList(description: string) {
    const lines = description.split('\n').map(line => line.trim()).filter(Boolean);
    const result: React.ReactNode[] = [];
    let currentList: string[] = [];
    let currentHeading: string | null = null;

    const pushList = () => {
      if (currentList.length > 0) {
        result.push(
          <ul className="list-disc pl-6 space-y-2 text-gray-700" key={Math.random()}>
            {currentList.map((item, idx) => <li key={idx}>{item.replace(/^\u2022\s*/, '')}</li>)}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line, idx) => {
      // Heading detection (e.g., "Responsibilities:", "Requirements:", "Benefits:")
      if (/^(Responsibilities|Requirements|Benefits)[:：]?$/.test(line)) {
        pushList();
        currentHeading && result.push(<br key={`br-${idx}`} />);
        currentHeading = line.replace(/[:：]$/, '');
        result.push(<strong key={line + idx} className="block mt-4 mb-2">{currentHeading}</strong>);
      } else if (line.startsWith('•') || line.startsWith('-')) {
        currentList.push(line.replace(/^[-•]\s*/, ''));
      } else {
        pushList();
        result.push(<li key={line + idx}>{line}</li>);
      }
    });
    pushList();
    return result;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
          <Link to="/google-jobs">
            <Button>Back to Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const matchData = getMatchData();
  const companyName = job.companyName || 'Unknown Company';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/google-jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl font-semibold text-gray-600">
                      {companyName.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold">{job.title}</h1>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < 5 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm font-medium ml-1">{matchData.overall}%</span>
                      </div>
                    </div>
                    
                    <p className="text-lg text-gray-600 mb-2">{companyName}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.scheduleType|| 'Full-time'}
                      </span>
                      {job.salary && (
                        <span className="font-medium">{job.salary}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <span>Posted {job.postedAt || '1 months ago'}</span>
                      <span>•</span>
                      <span>Via {job.via || 'LinkedIn'}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700" 
                        onClick={handleApplyNow}
                        disabled={!job?.applyLinks}
                      >
                        Apply Now
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Bookmark className="h-4 w-4" />
                        Save Job
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Share className="h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-2 mt-6">
                  <Badge variant="secondary">Remote</Badge>
                  <Badge variant="outline">JavaScript</Badge>
                  <Badge variant="outline">React</Badge>
                  <Badge variant="outline">Node.js</Badge>
                  <Badge variant="outline">TypeScript</Badge>
                  <Badge variant="outline">AWS</Badge>
                  <Badge variant="outline">CI/CD</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Job Details Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                        {job.description && typeof job.description === 'string' ? (
                          (() => {
                            const lines = job.description.split('\n').map(line => line.trim()).filter(Boolean);
                            const displayLines = showFullDescription ? lines : lines.slice(0, 10);
                            return (
                              <div className="prose max-w-none">
                                {parseDescriptionToList(displayLines.join('\n'))}
                                {lines.length > 10 && (
                                  <Button
                                    variant="ghost"
                                    className="mt-2 px-0 text-blue-600 hover:underline"
                                    onClick={() => setShowFullDescription(v => !v)}
                                  >
                                    {showFullDescription ? 'View Less' : 'View More'}
                                  </Button>
                                )}
                              </div>
                            );
                          })()
                        ) : Array.isArray(job.description) && job.description.length > 0 ? (
                          (() => {
                            const displayLines = Array.isArray(job.description)
                              ? (showFullDescription ? job.description : job.description.slice(0, 10))
                              : [];
                            return (
                              <>
                                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                  {Array.isArray(displayLines)
                                    ? displayLines.map((desc: string, index: number) => (
                                        <li key={index}>{desc}</li>
                                      ))
                                    : null}
                                </ul>
                                {job.description.length > 10 && (
                                  <Button
                                    variant="ghost"
                                    className="mt-2 px-0 text-blue-600 hover:underline"
                                    onClick={() => setShowFullDescription(v => !v)}
                                  >
                                    {showFullDescription ? 'View Less' : 'View More'}
                                  </Button>
                                )}
                              </>
                            );
                          })()
                        ) : (
                          <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li>We are looking for a Senior Software Engineer to join our dynamic team and lead development efforts.</li>
                          </ul>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Responsibilities</h3>
                        {job.responsibilities && Array.isArray(job.responsibilities) && job.responsibilities.length > 0 ? (
                          <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            {job.responsibilities.map((responsibility, index) => (
                              <li key={index}>{responsibility}</li>
                            ))}
                          </ul>
                        ) : job.responsibilities && typeof job.responsibilities === 'string' ? (
                          <p className="text-gray-700 leading-relaxed">{job.responsibilities}</p>
                        ) : (
                          <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li>Design, develop, and maintain software applications.</li>
                            <li>Collaborate with cross-functional teams to define project requirements.</li>
                            <li>Mentor junior developers.</li>
                            <li>Conduct code reviews and ensure best practices.</li>
                          </ul>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Qualifications</h3>
                        {job.qualifications && typeof job.qualifications === 'string' ? (
                          job.qualifications.includes(',') ? (
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                              {job.qualifications
                                .split(',')
                                .map(line => line.trim())
                                .filter(line => line)
                                .map((line, index) => (
                                  <li key={index}>{line}</li>
                                ))}
                            </ul>
                          ) : (
                            <div className="prose max-w-none">
                              {parseDescriptionToList(job.qualifications)}
                            </div>
                          )
                        ) : job.qualifications && Array.isArray(job.qualifications) && job.qualifications.length > 0 ? (
                          <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            {job.qualifications.map((qual, index) => (
                              <li key={index}>{qual}</li>
                            ))}
                          </ul>
                        ) : (
                          <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li>Bachelor's degree in Computer Science or related field.</li>
                            <li>5+ years experience in software development.</li>
                          </ul>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Benefits</h3>
                        {job.benefits && Array.isArray(job.benefits) && job.benefits.length > 0 ? (
                          <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            {job.benefits.map((benefit, index) => (
                              <li key={index}>{benefit}</li>
                            ))}
                          </ul>
                        ) : job.benefits && typeof job.benefits === 'string' ? (
                          <p className="text-gray-700 leading-relaxed">{job.benefits}</p>
                        ) : (
                          <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li>Health insurance</li>
                            <li>401(k) matching</li>
                            <li>Paid time off</li>
                            <li>Remote work opportunities</li>
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t">
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700" 
                        onClick={handleApplyNow}
                        disabled={!job?.applyLinks}
                      >
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="company" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3">About {companyName}</h3>
                    <p className="text-gray-700">
                      {companyName} is a leading technology company focused on innovation and excellence.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3">Company Reviews</h3>
                    <p className="text-gray-700">
                      Employer reviews and ratings would be displayed here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Job Insights */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-blue-600" />
                    AI Job Insights
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="match" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="match" className="text-xs">Match</TabsTrigger>
                    <TabsTrigger value="skills" className="text-xs">Skills</TabsTrigger>
                    <TabsTrigger value="tips" className="text-xs">Tips</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="match" className="mt-4 space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Overall Match</span>
                        <span className="text-sm font-bold text-blue-600">{matchData.overall}%</span>
                      </div>
                      <Progress value={matchData.overall} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Skills Match</span>
                        <span className="text-sm font-medium">{matchData.skills}%</span>
                      </div>
                      <Progress value={matchData.skills} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Experience Match</span>
                        <span className="text-sm font-medium">{matchData.experience}%</span>
                      </div>
                      <Progress value={matchData.experience} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Education Match</span>
                        <span className="text-sm font-medium">{matchData.education}%</span>
                      </div>
                      <Progress value={matchData.education} className="h-2" />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="skills" className="mt-4">
                    <p className="text-sm text-gray-600">Skills analysis would be displayed here.</p>
                  </TabsContent>
                  
                  <TabsContent value="tips" className="mt-4">
                    <p className="text-sm text-gray-600">Application tips would be displayed here.</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Application Process */}
            <Card>
              <CardHeader>
                <CardTitle>Application Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">1</div>
                  <div>
                    <h4 className="font-medium text-sm">Apply Online</h4>
                    <p className="text-xs text-gray-600">Submit your resume and cover letter</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center font-medium">2</div>
                  <div>
                    <h4 className="font-medium text-sm">Initial Screening</h4>
                    <p className="text-xs text-gray-600">Phone or video interview with HR</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center font-medium">3</div>
                  <div>
                    <h4 className="font-medium text-sm">Technical Interview</h4>
                    <p className="text-xs text-gray-600">Assessment of skills and experience</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center font-medium">4</div>
                  <div>
                    <h4 className="font-medium text-sm">Final Decision</h4>
                    <p className="text-xs text-gray-600">Offer and negotiation</p>
                  </div>
                </div>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-6" onClick={handleApplyNow}>
                  Apply Now
                </Button>
              </CardContent>
            </Card>

            {/* Similar Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {similarJobs.length === 0 && <div className="text-sm text-gray-500">No similar jobs found.</div>}
                {similarJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-medium">
                        {job.companyName?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{job.title}</h4>
                        <p className="text-xs text-gray-600">{job.companyName}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{job.location}</span>
                      <Badge variant="outline" className="text-xs">{job.scheduleType || 'Full-time'}</Badge>
                    </div>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        if (!isAuthenticated) {
                          navigate('/login');
                          return;
                        }
                        let url: string | undefined;
                        if (job.applyLinks) {
                          let links: string[] = [];
                          if (typeof job.applyLinks === 'string') {
                            try {
                              const parsed = JSON.parse(job.applyLinks);
                              if (Array.isArray(parsed)) {
                                links = parsed;
                              } else {
                                links = [job.applyLinks];
                              }
                            } catch {
                              links = [job.applyLinks];
                            }
                          } else if (Array.isArray(job.applyLinks)) {
                            links = job.applyLinks;
                          }
                          url = links[0];
                          if (url) {
                            url = url.trim();
                            if (!/^https?:\/\//i.test(url)) {
                              url = 'https://' + url.replace(/^\/+/, '');
                            }
                            window.open(url, '_blank');
                          }
                        }
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;