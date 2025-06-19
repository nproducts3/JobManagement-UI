
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Building, Clock } from 'lucide-react';
import { GoogleJob } from '@/types/api';

const JobsList = () => {
  const [jobs, setJobs] = useState<GoogleJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<GoogleJob[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = jobs.filter(
        job =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(jobs);
    }
  }, [searchTerm, jobs]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/google-jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
        setFilteredJobs(data);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Find Your Next Job</h1>
            <p className="text-gray-600">Discover opportunities that match your skills</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search jobs, companies, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
        </div>

        {/* Jobs List */}
        <div className="grid gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">
                      <Link 
                        to={`/jobs/${job.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {job.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {job.company_name}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                      )}
                      {job.posted_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.posted_at}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {job.salary && (
                      <Badge variant="secondary">{job.salary}</Badge>
                    )}
                    {job.schedule_type && (
                      <Badge variant="outline">{job.schedule_type}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {job.description && (
                  <p className="text-gray-600 line-clamp-3 mb-4">
                    {job.description.substring(0, 200)}...
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {job.via && (
                      <Badge variant="outline">via {job.via}</Badge>
                    )}
                  </div>
                  <Button asChild>
                    <Link to={`/jobs/${job.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No jobs found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsList;
