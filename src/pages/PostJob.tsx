import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { City, User } from '@/types/api';

const PostJob = () => {
  const [formData, setFormData] = useState({
    jobId: '',
    title: '',
    companyName: '',
    location: '',
    cityId: '',
    salary: '',
    scheduleType: '',
    via: '',
    description: '',
    qualifications: '',
    responsibilities: '',
    benefits: '',
    applyLinks: '',
  });
  const [cities, setCities] = useState<City[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, role } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCities();
    fetchEmployees();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/cities');
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
      const response = await fetch(`http://localhost:8080/api/users?organization_id=${user?.organizationId}`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.filter((emp: User) => emp.id !== user?.id));
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const jobData = {
        ...formData,
        cityId: formData.cityId ? parseInt(formData.cityId) : null,
        responsibilities: formData.responsibilities ? JSON.parse(`["${formData.responsibilities.split(',').join('","')}"]`) : null,
        benefits: formData.benefits ? JSON.parse(`["${formData.benefits.split(',').join('","')}"]`) : null,
        posted_by: selectedEmployee || user?.id,
      };
      // Remove 'id' if present (defensive)
      if ('id' in jobData) delete jobData.id;

      const response = await fetch('http://localhost:8080/api/google-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Job posted successfully.",
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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Only allow ROLE_ADMIN or ROLE_EMPLOYEE to post jobs
  if (role && !(role.roleName === 'ROLE_ADMIN' || role.roleName === 'ROLE_EMPLOYEE')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Forbidden</CardTitle>
            <CardDescription>You do not have permission to post jobs.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Post a New Job</CardTitle>
          <CardDescription>
            Fill in the details to post a new job opportunity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Post on behalf of (optional) */}
            <div className="space-y-2">
              <Label htmlFor="employee">Post on behalf of (optional)</Label>
              <Select onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee (or post as yourself)" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} ({employee.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="jobId">Job ID</Label>
                <Input
                  id="jobId"
                  placeholder="Unique job identifier"
                  value={formData.jobId}
                  onChange={(e) => handleChange('jobId', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Software Engineer"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., New York, NY"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select onValueChange={(value) => handleChange('cityId', value)}>
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
              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  placeholder="e.g., $50,000 - $70,000"
                  value={formData.salary}
                  onChange={(e) => handleChange('salary', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="scheduleType">Schedule Type</Label>
                <Select onValueChange={(value) => handleChange('scheduleType', value)}>
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
              <div className="space-y-2">
                <Label htmlFor="via">Via</Label>
                <Input
                  id="via"
                  placeholder="Job board or source"
                  value={formData.via}
                  onChange={(e) => handleChange('via', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="applyLinks">Apply Links</Label>
              <Input
                id="applyLinks"
                placeholder="Application URL"
                    value={formData.applyLinks}
                onChange={(e) => handleChange('applyLinks', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the job role and responsibilities..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualifications">Qualifications</Label>
              <Textarea
                id="qualifications"
                placeholder="Required qualifications and skills..."
                value={formData.qualifications}
                onChange={(e) => handleChange('qualifications', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsibilities (comma-separated)</Label>
              <Textarea
                id="responsibilities"
                placeholder="List key responsibilities separated by commas"
                value={formData.responsibilities}
                onChange={(e) => handleChange('responsibilities', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits (comma-separated)</Label>
              <Textarea
                id="benefits"
                placeholder="List benefits separated by commas"
                value={formData.benefits}
                onChange={(e) => handleChange('benefits', e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Posting Job...' : 'Post Job'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostJob;
