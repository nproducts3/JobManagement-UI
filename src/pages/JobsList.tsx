import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, MapPin, Clock, Star, Bookmark, Filter as FilterIcon } from 'lucide-react';
import { GoogleJob } from '@/types/api';

const KNOWN_SKILLS = ['JavaScript', 'React', 'Python', 'AWS', 'Node.js', 'TypeScript'];
const KNOWN_EXPERIENCE = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'];
const KNOWN_REMOTE = ['Remote', 'Hybrid', 'On-site'];

function extractSkills(qualifications: string | undefined): string[] {
  if (!qualifications) return [];
  const lower = qualifications.toLowerCase();
  return KNOWN_SKILLS.filter(skill => lower.includes(skill.toLowerCase()));
}

function extractExperience(text: string | undefined): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  return KNOWN_EXPERIENCE.filter(level => {
    if (level === 'Entry Level') return lower.includes('entry') || lower.includes('junior') || lower.includes('0-2 years');
    if (level === 'Mid Level') return lower.includes('mid') || lower.includes('3-5 years');
    if (level === 'Senior Level') return lower.includes('senior') || lower.includes('lead') || lower.includes('5+ years');
    if (level === 'Executive') return lower.includes('manager') || lower.includes('director') || lower.includes('vp') || lower.includes('cto') || lower.includes('ceo');
    return false;
  });
}

function extractRemote(job: GoogleJob): string[] {
  const location = job.location?.toLowerCase() || '';
  const description = job.description?.toLowerCase() || '';
  const scheduleType = job.scheduleType?.toLowerCase() || '';
  const remote: string[] = [];
  if (location.includes('remote') || description.includes('remote') || scheduleType.includes('remote')) remote.push('Remote');
  if (location.includes('hybrid') || description.includes('hybrid') || scheduleType.includes('hybrid')) remote.push('Hybrid');
  if (
    !location.includes('remote') && !location.includes('hybrid') &&
    !description.includes('remote') && !description.includes('hybrid') &&
    !scheduleType.includes('remote') && !scheduleType.includes('hybrid')
  ) remote.push('On-site');
  return remote;
}

const JOBS_PER_PAGE = 10;

const JobsList = () => {
  const [jobs, setJobs] = useState<GoogleJob[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');
  const [salaryRange, setSalaryRange] = useState([0]);
  const navigate = useNavigate();

  // Filter states
  const [jobTypeFilters, setJobTypeFilters] = useState({
    fullTime: false,
    partTime: false,
    contract: false,
    internship: false
  });

  const [experienceFilters, setExperienceFilters] = useState({
    entryLevel: false,
    midLevel: false,
    seniorLevel: false,
    executive: false
  });

  const [remoteFilters, setRemoteFilters] = useState({
    remote: false,
    hybrid: false,
    onsite: false
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    fetchJobs();
  }, [currentPage]);

  useEffect(() => {
    setSearchParams({ ...Object.fromEntries(searchParams.entries()), page: currentPage.toString() });
  }, [currentPage]);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/google-jobs?page=${currentPage - 1}&size=${JOBS_PER_PAGE}`);
      if (response.ok) {
        const data = await response.json();
        // Use backend response: { content, totalElements }
        const jobsWithExtracted = data.content.map((job: GoogleJob) => ({
          ...job,
          extractedSkills: extractSkills(job.qualifications),
          extractedExperience: extractExperience((job.qualifications || '') + ' ' + (job.description || '')),
          extractedRemote: extractRemote(job)
        }));
        setJobs(jobsWithExtracted);
        setTotalJobs(data.totalElements);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyNow = (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/google-jobs/${jobId}`);
  };

  const getMatchPercentage = () => {
    return Math.floor(Math.random() * 40) + 60; // Random percentage between 60-100 for demo
  };

  const resetFilters = () => {
    setJobTypeFilters({ fullTime: false, partTime: false, contract: false, internship: false });
    setExperienceFilters({ entryLevel: false, midLevel: false, seniorLevel: false, executive: false });
    setRemoteFilters({ remote: false, hybrid: false, onsite: false });
    setSelectedSkills([]);
    setSalaryRange([0]);
    setSearchTerm('');
  };

  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);

  const handlePageChange = (pageNum: number) => {
    setSearchParams({ ...Object.fromEntries(searchParams.entries()), page: pageNum.toString() });
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
      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <div className="w-80 flex-shrink-0">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FilterIcon className="h-5 w-5" />
                  Filters
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Job Type */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Job Type
                </h3>
                <div className="space-y-2">
                  {Object.entries(jobTypeFilters).map(([key, checked]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={checked}
                        onCheckedChange={(checked) =>
                          setJobTypeFilters(prev => ({ ...prev, [key]: !!checked }))
                        }
                      />
                      <label htmlFor={key} className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Experience Level
                </h3>
                <div className="space-y-2">
                  {Object.entries(experienceFilters).map(([key, checked]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={checked}
                        onCheckedChange={(checked) =>
                          setExperienceFilters(prev => ({ ...prev, [key]: !!checked }))
                        }
                      />
                      <label htmlFor={key} className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remote Options */}
              <div>
                <h3 className="font-medium mb-3">Remote Options</h3>
                <div className="space-y-2">
                  {Object.entries(remoteFilters).map(([key, checked]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={checked}
                        onCheckedChange={(checked) =>
                          setRemoteFilters(prev => ({ ...prev, [key]: !!checked }))
                        }
                      />
                      <label htmlFor={key} className="text-sm capitalize">
                        {key === 'onsite' ? 'On-site' : key}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <h3 className="font-medium mb-3">Salary Range</h3>
                <div className="px-2">
                  <Slider
                    value={salaryRange}
                    onValueChange={setSalaryRange}
                    max={200000}
                    step={10000}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                    <span>$0</span>
                    <span>${salaryRange[0].toLocaleString()}</span>
                    <span>$200k+</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="font-medium mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {['JavaScript', 'React', 'Python', 'AWS', 'Node.js', 'TypeScript'].map((skill) => (
                    <Badge
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedSkills(prev =>
                          prev.includes(skill)
                            ? prev.filter(s => s !== skill)
                            : [...prev, skill]
                        );
                      }}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
              {jobs.length} Jobs Found
            </h1>
            <p className="text-gray-600">Based on your search criteria</p>
          </div>

          {/* Search and Sort */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search job title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {jobs.map((job) => {
              const matchPercentage = getMatchPercentage();
              const companyName = job.companyName || 'Unknown Company';
              const jobTitle = job.title || 'Unknown Position';
              
              return (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg font-semibold text-gray-600">
                              {companyName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Link 
                                to={`/google-jobs/${job.id}`}
                                className="text-xl font-semibold hover:text-blue-600 transition-colors"
                              >
                                {jobTitle}
                              </Link>
                              <Bookmark className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                            </div>
                            
                            <p className="text-gray-600 mb-2">{companyName}</p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              {job.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {job.location}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {job.scheduleType || 'Full-time'}
                              </span>
                              {job.salary && (
                                <span className="font-medium">{job.salary}</span>
                              )}
                            </div>

                            {/* Skills/Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.extractedRemote && job.extractedRemote.map((remote: string, i: number) => (
                                <Badge key={`remote-${i}`} variant="secondary">{remote}</Badge>
                              ))}
                              {job.extractedExperience && job.extractedExperience.map((exp: string, i: number) => (
                                <Badge key={`exp-${i}`} variant="outline">{exp}</Badge>
                              ))}
                              {job.extractedSkills && job.extractedSkills.length > 0 && job.extractedSkills.map((skill: string, index: number) => (
                                <Badge key={`skill-${index}`} variant="outline">{skill}</Badge>
                              ))}
                            </div>

                            {job.description && (
                              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                {job.description.substring(0, 150)}...
                              </p>
                            )}

                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>Posted {job.postedAt || '1 months ago'}</span>
                              <span>•</span>
                              <span>Via {job.via || 'LinkedIn'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 ml-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(matchPercentage / 20) 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{matchPercentage}% Match</span>
                        </div>
                        
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={(e) => handleApplyNow(job.id, e)}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {(() => {
                // Calculate the two page numbers to show
                let start = Math.max(1, currentPage - 1);
                let end = Math.min(totalPages, start + 1);
                // If we're at the last page, show the last two
                if (end === totalPages && totalPages > 1) start = totalPages - 1;
                // If only one page, start at 1
                if (totalPages === 1) start = 1;
                return Array.from({ length: Math.min(2, totalPages) }, (_, i) => start + i).map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`px-3 py-1 rounded border ${currentPage === pageNum ? 'bg-blue-600 text-white' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                ));
              })()}
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}

          {jobs.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No jobs found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsList;
