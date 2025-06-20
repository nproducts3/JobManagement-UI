
// import { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import { MapPin, Building, Clock, ExternalLink, ArrowLeft } from 'lucide-react';
// import { GoogleJob } from '@/types/api';
// import { useAuth } from '@/contexts/AuthContext';

// const JobDetails = () => {
//   const { id } = useParams<{ id: string }>();
//   const [job, setJob] = useState<GoogleJob | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const { isAuthenticated, role } = useAuth();

//   useEffect(() => {
//     if (id) {
//       fetchJobDetails(id);
//     }
//   }, [id]);

//   const fetchJobDetails = async (jobId: string) => {
//     try {
//       const response = await fetch(`/api/google-jobs/${jobId}`);
//       if (response.ok) {
//         const data = await response.json();
//         setJob(data);
//       }
//     } catch (error) {
//       console.error('Failed to fetch job details:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleApply = () => {
//     if (job?.applyLinks) {
//       window.open(job.applyLinks, '_blank');
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-lg">Loading job details...</div>
//       </div>
//     );
//   }

//   if (!job) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
//           <Link to="/jobs">
//             <Button>Back to Jobs</Button>
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="max-w-4xl mx-auto">
//         {/* Back Button */}
//         <Button variant="ghost" asChild className="mb-6">
//           <Link to="/jobs">
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back to Jobs
//           </Link>
//         </Button>

//         {/* Job Header */}
//         <Card className="mb-6">
//           <CardHeader>
//             <div className="flex justify-between items-start">
//               <div className="flex-1">
//                 <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
//                 <CardDescription className="flex items-center gap-4 text-lg">
//                   <span className="flex items-center gap-2">
//                     <Building className="h-5 w-5" />
//                     {job.companyName}
//                   </span>
//                   {job.location && (
//                     <span className="flex items-center gap-2">
//                       <MapPin className="h-5 w-5" />
//                       {job.location}
//                     </span>
//                   )}
//                   {job.postedAt && (
//                     <span className="flex items-center gap-2">
//                       <Clock className="h-5 w-5" />
//                       {job.postedAt}
//                     </span>
//                   )}
//                 </CardDescription>
//               </div>
//               <div className="flex flex-col gap-3">
//                 {job.salary && (
//                   <Badge variant="secondary" className="text-lg px-3 py-1">
//                     {job.salary}
//                   </Badge>
//                 )}
//                 <div className="flex gap-2">
//                   <Button onClick={handleApply} size="lg">
//                     Apply Now
//                     <ExternalLink className="h-4 w-4 ml-2" />
//                   </Button>
//                   {isAuthenticated && role?.roleName === 'ROLE_JOBSEEKER' && (
//                     <Button variant="outline" size="lg">
//                       Save Job
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </CardHeader>
//         </Card>

//         <div className="grid md:grid-cols-3 gap-6">
//           {/* Main Content */}
//           <div className="md:col-span-2 space-y-6">
//             {/* Job Description */}
//             {job.description && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Job Description</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="prose max-w-none">
//                     {job.description.split('\n').map((paragraph, index) => (
//                       <p key={index} className="mb-4">
//                         {paragraph}
//                       </p>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Responsibilities */}
//             {job.responsibilities && Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Responsibilities</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <ul className="list-disc pl-6 space-y-2">
//                     {job.responsibilities.map((responsibility, index) => (
//                       <li key={index}>{responsibility}</li>
//                     ))}
//                   </ul>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Qualifications */}
//             {job.qualifications && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Qualifications</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="prose max-w-none">
//                     {job.qualifications.split('\n').map((line, index) => (
//                       <p key={index} className="mb-2">
//                         {line}
//                       </p>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Benefits */}
//             {job.benefits && Array.isArray(job.benefits) && job.benefits.length > 0 && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Benefits</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <ul className="list-disc pl-6 space-y-2">
//                     {job.benefits.map((benefit, index) => (
//                       <li key={index}>{benefit}</li>
//                     ))}
//                   </ul>
//                 </CardContent>
//               </Card>
//             )}
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Job Details */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Job Details</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {job.scheduleType && (
//                   <div>
//                     <h4 className="font-medium mb-1">Schedule</h4>
//                     <Badge variant="outline">{job.scheduleType}</Badge>
//                   </div>
//                 )}
//                 {job.via && (
//                   <div>
//                     <h4 className="font-medium mb-1">Source</h4>
//                     <p className="text-sm text-gray-600">via {job.via}</p>
//                   </div>
//                 )}
//                 {job.shareLink && (
//                   <div>
//                     <h4 className="font-medium mb-1">Share</h4>
//                     <Button 
//                       variant="outline" 
//                       size="sm" 
//                       onClick={() => navigator.clipboard.writeText(job.shareLink || '')}
//                     >
//                       Copy Link
//                     </Button>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* Quick Apply */}
//             {isAuthenticated && role?.roleName === 'ROLE_JOBSEEKER' && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Quick Apply</CardTitle>
//                   <CardDescription>Apply with your saved resume</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <Button className="w-full" size="lg">
//                     Apply with Resume
//                   </Button>
//                 </CardContent>
//               </Card>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default JobDetails;



import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Building, Clock, Star, ArrowLeft, Share, Bookmark } from 'lucide-react';
import { GoogleJob } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<GoogleJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (id) {
      fetchJobDetails(id);
    }
  }, [id]);

  const fetchJobDetails = async (jobId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/google-jobs/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      } else {
        // If specific job not found, get from the list
        const listResponse = await fetch('http://localhost:8080/api/google-jobs');
        if (listResponse.ok) {
          const jobs = await listResponse.json();
          const foundJob = jobs.find((j: GoogleJob) => j.id === jobId);
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

  const handleApplyNow = () => {
    if (job?.applyLinks) {
      window.open(job.applyLinks, '_blank');
    }
  };

  const getMatchData = () => ({
    overall: 95,
    skills: 90,
    experience: 85,
    education: 80
  });

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
          <Link to="/jobs">
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
          <Link to="/jobs">
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
                      <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleApplyNow}>
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
                        <p className="text-gray-700 leading-relaxed">
                          {job.description || "We are looking for a Senior Software Engineer to join our dynamic team and lead development efforts."}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Responsibilities</h3>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                          <li>Design, develop, and maintain software applications.</li>
                          <li>Collaborate with cross-functional teams to define project requirements.</li>
                          <li>Mentor junior developers.</li>
                          <li>Conduct code reviews and ensure best practices.</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Qualifications</h3>
                        <p className="text-gray-700">
                          {job.qualifications || "Bachelor's degree in Computer Science or related field. 5+ years experience in software development."}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Benefits</h3>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                          <li>Health insurance</li>
                          <li>401(k) matching</li>
                          <li>Paid time off</li>
                          <li>Remote work opportunities</li>
                        </ul>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t">
                      <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleApplyNow}>
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
                      Employee reviews and ratings would be displayed here.
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
                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-medium">C</div>
                    <div>
                      <h4 className="font-medium text-sm">DevOps Engineer</h4>
                      <p className="text-xs text-gray-600">CloudTech</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Seattle, WA</span>
                    <Badge variant="outline" className="text-xs">Remote</Badge>
                  </div>
                  <div className="text-xs text-blue-600 font-medium mt-1">82% Match</div>
                </div>
                
                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-medium">C</div>
                    <div>
                      <h4 className="font-medium text-sm">Marketing Manager</h4>
                      <p className="text-xs text-gray-600">Creative Solutions Ltd.</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">New York, NY</span>
                    <Badge variant="outline" className="text-xs">Full-time</Badge>
                  </div>
                  <div className="text-xs text-blue-600 font-medium mt-1">88% Match</div>
                </div>
                
                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-medium">D</div>
                    <div>
                      <h4 className="font-medium text-sm">UI/UX Designer</h4>
                      <p className="text-xs text-gray-600">DesignHub</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Austin, TX</span>
                    <Badge variant="outline" className="text-xs">Full-time</Badge>
                  </div>
                  <div className="text-xs text-blue-600 font-medium mt-1">75% Match</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
