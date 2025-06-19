
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Building, Clock, ExternalLink, ArrowLeft } from 'lucide-react';
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
      const response = await fetch(`/api/google-jobs/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      }
    } catch (error) {
      console.error('Failed to fetch job details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (job?.apply_links) {
      window.open(job.apply_links, '_blank');
    }
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>

        {/* Job Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 text-lg">
                  <span className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {job.company_name}
                  </span>
                  {job.location && (
                    <span className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {job.location}
                    </span>
                  )}
                  {job.posted_at && (
                    <span className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {job.posted_at}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex flex-col gap-3">
                {job.salary && (
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {job.salary}
                  </Badge>
                )}
                <div className="flex gap-2">
                  <Button onClick={handleApply} size="lg">
                    Apply Now
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                  {isAuthenticated && role?.role_name === 'ROLE_JOBSEEKER' && (
                    <Button variant="outline" size="lg">
                      Save Job
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Job Description */}
            {job.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {job.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Responsibilities */}
            {job.responsibilities && Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-6 space-y-2">
                    {job.responsibilities.map((responsibility, index) => (
                      <li key={index}>{responsibility}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Qualifications */}
            {job.qualifications && (
              <Card>
                <CardHeader>
                  <CardTitle>Qualifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {job.qualifications.split('\n').map((line, index) => (
                      <p key={index} className="mb-2">
                        {line}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && Array.isArray(job.benefits) && job.benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-6 space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.schedule_type && (
                  <div>
                    <h4 className="font-medium mb-1">Schedule</h4>
                    <Badge variant="outline">{job.schedule_type}</Badge>
                  </div>
                )}
                {job.via && (
                  <div>
                    <h4 className="font-medium mb-1">Source</h4>
                    <p className="text-sm text-gray-600">via {job.via}</p>
                  </div>
                )}
                {job.share_link && (
                  <div>
                    <h4 className="font-medium mb-1">Share</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigator.clipboard.writeText(job.share_link || '')}
                    >
                      Copy Link
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Apply */}
            {isAuthenticated && role?.role_name === 'ROLE_JOBSEEKER' && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Apply</CardTitle>
                  <CardDescription>Apply with your saved resume</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" size="lg">
                    Apply with Resume
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
