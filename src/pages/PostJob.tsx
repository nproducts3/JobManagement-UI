
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { JobTitle, City, User } from '@/types/api';
import { useNavigate } from 'react-router-dom';

interface PostJobForm {
  job_id: string;
  title: string;
  company_name: string;
  location: string;
  via: string;
  share_link: string;
  posted_at: string;
  salary: string;
  schedule_type: string;
  qualifications: string;
  description: string;
  responsibilities: string[];
  benefits: string[];
  apply_links: string;
  job_title_id: number | null;
  city_id: number | null;
}

const PostJob = () => {
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PostJobForm>({
    job_id: '',
    title: '',
    company_name: '',
    location: '',
    via: '',
    share_link: '',
    posted_at: new Date().toISOString(),
    salary: '',
    schedule_type: '',
    qualifications: '',
    description: '',
    responsibilities: [],
    benefits: [],
    apply_links: '',
    job_title_id: null,
    city_id: null,
  });

  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobTitles();
    fetchCities();
    fetchEmployees();
  }, []);

  const fetchJobTitles = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/job-titles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setJobTitles(data);
      }
    } catch (error) {
      console.error('Failed to fetch job titles:', error);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/cities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCities(data);
      }
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/users?organization_id=${user?.organization_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleInputChange = (field: keyof PostJobForm, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'responsibilities' | 'benefits', value: string) => {
    const items = value.split('\n').filter(item => item.trim() !== '');
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const jobData = {
        ...formData,
        id: crypto.randomUUID(),
        job_id: formData.job_id || crypto.randomUUID(),
        responsibilities: JSON.stringify(formData.responsibilities),
        benefits: JSON.stringify(formData.benefits),
        posted_by_user_id: selectedEmployee || user?.id,
      };

      const response = await fetch('http://localhost:8080/api/google-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Job posted successfully!",
        });
        navigate('/employer-dashboard');
      } else {
        throw new Error('Failed to post job');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Post a New Job</CardTitle>
          <CardDescription>
            Create a job posting using the google_jobs structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Post on behalf of employee */}
            <div>
              <Label htmlFor="employee">Post on behalf of (optional)</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee (or post as yourself)" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name} ({employee.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="job_id">Job ID</Label>
                <Input
                  id="job_id"
                  value={formData.job_id}
                  onChange={(e) => handleInputChange('job_id', e.target.value)}
                  placeholder="Unique job identifier"
                />
              </div>
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="job_title_id">Job Title Category</Label>
                <Select value={formData.job_title_id?.toString() || ''} onValueChange={(value) => handleInputChange('job_title_id', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job title category" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTitles.map((jobTitle) => (
                      <SelectItem key={jobTitle.id} value={jobTitle.id.toString()}>
                        {jobTitle.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city_id">City</Label>
                <Select value={formData.city_id?.toString() || ''} onValueChange={(value) => handleInputChange('city_id', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}, {city.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  placeholder="e.g., $50,000 - $70,000"
                />
              </div>
              <div>
                <Label htmlFor="schedule_type">Schedule Type</Label>
                <Select value={formData.schedule_type} onValueChange={(value) => handleInputChange('schedule_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Temporary">Temporary</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="via">Via</Label>
                <Input
                  id="via"
                  value={formData.via}
                  onChange={(e) => handleInputChange('via', e.target.value)}
                  placeholder="Job board or source"
                />
              </div>
              <div>
                <Label htmlFor="apply_links">Apply Links</Label>
                <Input
                  id="apply_links"
                  value={formData.apply_links}
                  onChange={(e) => handleInputChange('apply_links', e.target.value)}
                  placeholder="Application URL"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="qualifications">Qualifications</Label>
              <Textarea
                id="qualifications"
                value={formData.qualifications}
                onChange={(e) => handleInputChange('qualifications', e.target.value)}
                rows={3}
                placeholder="Required qualifications and skills"
              />
            </div>

            <div>
              <Label htmlFor="responsibilities">Responsibilities (one per line)</Label>
              <Textarea
                id="responsibilities"
                value={formData.responsibilities.join('\n')}
                onChange={(e) => handleArrayChange('responsibilities', e.target.value)}
                rows={3}
                placeholder="Key responsibilities (one per line)"
              />
            </div>

            <div>
              <Label htmlFor="benefits">Benefits (one per line)</Label>
              <Textarea
                id="benefits"
                value={formData.benefits.join('\n')}
                onChange={(e) => handleArrayChange('benefits', e.target.value)}
                rows={3}
                placeholder="Employee benefits (one per line)"
              />
            </div>

            <div>
              <Label htmlFor="share_link">Share Link</Label>
              <Input
                id="share_link"
                value={formData.share_link}
                onChange={(e) => handleInputChange('share_link', e.target.value)}
                placeholder="Shareable job posting URL"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Posting...' : 'Post Job'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/employer-dashboard')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostJob;
