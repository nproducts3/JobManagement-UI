import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Users, MoreHorizontal, Plus, Filter } from 'lucide-react';
import { GoogleJob } from '@/types/api';
import { useNavigate } from 'react-router-dom';

const JobPostingsTab = () => {
  const [jobs, setJobs] = useState<GoogleJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/google-jobs?page=0&size=20', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched jobs:', data);
        
        // Handle paginated response structure
        const jobsArray = Array.isArray(data.content) ? data.content : [];
        
        // Sort by created date (newest first) and take latest 4 jobs
        const sortedJobs = jobsArray.sort((a, b) => {
          const dateA = new Date(a.createdDateTime || a.postedAt || 0);
          const dateB = new Date(b.createdDateTime || b.postedAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        
        setJobs(sortedJobs.slice(0, 4)); // Get latest 4 jobs
      } else {
        console.error('Failed to fetch jobs:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string = 'active') => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || styles.active;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Posted recently';
    try {
      return `Posted ${new Date(dateString).toLocaleDateString()}`;
    } catch {
      return 'Posted recently';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading job postings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Job Postings</h2>
          <p className="text-gray-600">Manage your active job listings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button 
            onClick={() => navigate('/post-job')}
            className="bg-black hover:bg-gray-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Post Job
          </Button>
        </div>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{job.title || 'Untitled Position'}</h3>
                    <Badge className={getStatusBadge('active')}>
                      active
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-gray-600 mb-2">{job.companyName || 'Company Name'}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>{job.location || 'Location not specified'}</span>
                    <span>•</span>
                    <span>{job.scheduleType || 'Full-time'}</span>
                    <span>•</span>
                    <span>{job.salary || 'Salary not specified'}</span>
                    <span>•</span>
                    <span>{formatDate(job.postedAt)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <span>{Math.floor(Math.random() * 50) + 10} applicants</span>
                    <span>•</span>
                    <span>{Math.floor(Math.random() * 200) + 50} views</span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Users className="h-4 w-4 mr-1" />
                      Candidates
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {jobs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No job postings yet</h3>
            <p className="text-gray-500 mb-4">Create your first job posting to start attracting candidates.</p>
            <Button 
              onClick={() => navigate('/post-job')}
              className="bg-black hover:bg-gray-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post Your First Job
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobPostingsTab;
