import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Users, MoreHorizontal, Plus, Filter } from 'lucide-react';
import { GoogleJob } from '@/types/api';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { City } from '@/types/api';
import { cityService } from '@/services/cityService';

const JobPostingsTab = () => {
  const [jobs, setJobs] = useState<GoogleJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editJob, setEditJob] = useState<GoogleJob | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [jobseekers, setJobseekers] = useState<any[]>([]);
  const [showJobseekerDropdown, setShowJobseekerDropdown] = useState<string | null>(null); // jobId or null
  const [selectedJobseeker, setSelectedJobseeker] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;
  const [filterType, setFilterType] = useState<'relevance' | 'date'>('relevance');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchJobs(currentPage);
    cityService.getAll().then(setCities).catch(() => setCities([]));
  }, [currentPage]);

  const fetchJobs = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/google-jobs?page=${page - 1}&size=${PAGE_SIZE}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        let jobsArray = Array.isArray(data.content) ? data.content : [];
        if (filterType === 'date') {
          jobsArray = jobsArray.sort((a, b) => {
            const dateA = new Date(a.createdDateTime || a.postedAt || 0);
            const dateB = new Date(b.createdDateTime || b.postedAt || 0);
            return dateB.getTime() - dateA.getTime();
          });
        }
        setJobs(jobsArray);
        setTotalPages(data.totalPages || 1);
      } else {
        setJobs([]);
        setTotalPages(1);
      }
    } catch (error) {
      setJobs([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJobseekers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users/jobseekers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setJobseekers(data);
      }
    } catch (error) {
      console.error('Failed to fetch jobseekers:', error);
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

  const openEditModal = (job: GoogleJob) => {
    setEditJob(job);
    setEditForm({
      title: job.title || '',
      companyName: job.companyName || '',
      location: job.location || '',
      cityId: job.city?.id ? job.city.id.toString() : '',
      salary: job.salary || '',
      scheduleType: job.scheduleType || '',
      via: job.via || '',
      applyLinks: job.applyLinks || '',
      description: job.description || '',
      qualifications: job.qualifications || '',
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join(', ') : (job.responsibilities || ''),
      benefits: Array.isArray(job.benefits) ? job.benefits.join(', ') : (job.benefits || ''),
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (field: string, value: string) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    if (!editJob) return;
    setSaving(true);
    try {
      const payload = {
        ...editForm,
        cityId: editForm.cityId ? parseInt(editForm.cityId) : null,
        responsibilities: editForm.responsibilities ? JSON.parse(`["${editForm.responsibilities.split(',').map((s: string) => s.trim()).join('","')}"]`) : null,
        benefits: editForm.benefits ? JSON.parse(`["${editForm.benefits.split(',').map((s: string) => s.trim()).join('","')}"]`) : null,
      };
      // Remove id if present
      if ('id' in payload) delete payload.id;
      const response = await fetch(`http://localhost:8080/api/google-jobs/${editJob.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setEditModalOpen(false);
        setEditJob(null);
        fetchJobs();
      } else {
        alert('Failed to save job changes.');
      }
    } catch (error) {
      alert('Failed to save job changes.');
    } finally {
      setSaving(false);
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
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setShowFilterDropdown((v) => !v)} ref={filterRef}>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-10">
                <button
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterType === 'date' ? 'font-bold' : ''}`}
                  onClick={() => { setFilterType('date'); setShowFilterDropdown(false); fetchJobs(currentPage); }}
                >
                  Date (Newest)
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filterType === 'relevance' ? 'font-bold' : ''}`}
                  onClick={() => { setFilterType('relevance'); setShowFilterDropdown(false); fetchJobs(currentPage); }}
                >
                  Relevance
                </button>
              </div>
            )}
          </div>
          {/* <Button variant="outline" size="sm">
            Post on behalf of Employee
          </Button> */}
          {/* <Button 
            onClick={() => navigate('/post-job')}
            className="bg-black hover:bg-gray-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Post Job
          </Button> */}
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

                  <div className="flex items-center justify-end mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        setShowJobseekerDropdown(job.id);
                        if (jobseekers.length === 0) await fetchJobseekers();
                      }}
                    >
                      Post on behalf of Employee
                    </Button>
                    {showJobseekerDropdown === job.id && (
                      <div className="ml-2 w-64">
                        <Select
                          value={selectedJobseeker}
                          onValueChange={value => {
                            setSelectedJobseeker(value);
                            setShowJobseekerDropdown(null);
                            navigate(`/google-jobs/${job.id}?jobseeker=${value}`);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select jobseeker" />
                          </SelectTrigger>
                          <SelectContent>
                            {jobseekers.map(js => (
                              <SelectItem key={js.id} value={js.id}>
                                {js.firstName || js.user?.firstName || ''} {js.lastName || js.user?.lastName || ''} ({js.email || js.user?.email || ''})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <span>{Math.floor(Math.random() * 50) + 10} applicants</span>
                    <span>•</span>
                    <span>{Math.floor(Math.random() * 200) + 50} views</span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/google-jobs/${job.id}`)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(job)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
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

      {/* Edit Job Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Job Posting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={editForm.title}
              onChange={e => handleEditChange('title', e.target.value)}
              placeholder="Job Title"
            />
            <Input
              value={editForm.companyName}
              onChange={e => handleEditChange('companyName', e.target.value)}
              placeholder="Company Name"
            />
            <Input
              value={editForm.location}
              onChange={e => handleEditChange('location', e.target.value)}
              placeholder="Location"
            />
            <div className="space-y-2">
              <label htmlFor="cityId">City</label>
              <Select value={editForm.cityId} onValueChange={value => handleEditChange('cityId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}{city.state ? `, ${city.state}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              value={editForm.salary}
              onChange={e => handleEditChange('salary', e.target.value)}
              placeholder="Salary"
            />
            <Input
              value={editForm.scheduleType}
              onChange={e => handleEditChange('scheduleType', e.target.value)}
              placeholder="Schedule Type"
            />
            <Input
              value={editForm.via}
              onChange={e => handleEditChange('via', e.target.value)}
              placeholder="Via"
            />
            <Input
              value={editForm.applyLinks}
              onChange={e => handleEditChange('applyLinks', e.target.value)}
              placeholder="Apply Links"
            />
            <textarea
              className="w-full border rounded p-2"
              value={editForm.description}
              onChange={e => handleEditChange('description', e.target.value)}
              placeholder="Job Description"
              rows={3}
            />
            <textarea
              className="w-full border rounded p-2"
              value={editForm.qualifications}
              onChange={e => handleEditChange('qualifications', e.target.value)}
              placeholder="Qualifications"
              rows={2}
            />
            <textarea
              className="w-full border rounded p-2"
              value={editForm.responsibilities}
              onChange={e => handleEditChange('responsibilities', e.target.value)}
              placeholder="Responsibilities (comma-separated)"
              rows={2}
            />
            <textarea
              className="w-full border rounded p-2"
              value={editForm.benefits}
              onChange={e => handleEditChange('benefits', e.target.value)}
              placeholder="Benefits (comma-separated)"
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleEditSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobPostingsTab;
