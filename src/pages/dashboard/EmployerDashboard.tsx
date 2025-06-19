
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Organization, JobResume, User } from '@/types/api';
import { Building2, Users, FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmployerDashboard = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [applicants, setApplicants] = useState<JobResume[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.organization_id) {
      fetchOrganization();
      fetchApplicants();
      fetchEmployees();
    }
  }, [user]);

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/organizations/${user?.organization_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrganization(data);
      }
    } catch (error) {
      console.error('Failed to fetch organization:', error);
    }
  };

  const fetchApplicants = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/job-resumes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setApplicants(data);
      }
    } catch (error) {
      console.error('Failed to fetch applicants:', error);
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
        setEmployees(data.filter((emp: User) => emp.id !== user?.id));
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const updateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/organizations/${organization.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(organization),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Organization updated successfully.",
        });
      } else {
        throw new Error('Failed to update organization');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update organization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Employer Dashboard</h1>
        <Button onClick={() => navigate('/post-job')}>
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Organization Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Company Information
          </CardTitle>
          <CardDescription>
            Manage your organization details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {organization && (
            <form onSubmit={updateOrganization} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    value={organization.name || ''}
                    onChange={(e) => setOrganization(prev => prev ? {...prev, name: e.target.value} : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    value={organization.domain}
                    onChange={(e) => setOrganization(prev => prev ? {...prev, domain: e.target.value} : null)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={organization.description}
                  onChange={(e) => setOrganization(prev => prev ? {...prev, description: e.target.value} : null)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="logo_img_src">Logo URL</Label>
                <Input
                  id="logo_img_src"
                  value={organization.logo_img_src || ''}
                  onChange={(e) => setOrganization(prev => prev ? {...prev, logo_img_src: e.target.value} : null)}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                Update Organization
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Applicants Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Resume Applications
          </CardTitle>
          <CardDescription>
            View applicants and their resume match percentages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applicants.length > 0 ? (
            <div className="space-y-4">
              {applicants.map((applicant) => (
                <div key={applicant.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">Resume: {applicant.resume_file}</h3>
                      <p className="text-sm text-gray-600">Job ID: {applicant.googlejob_id}</p>
                      <p className="text-sm text-gray-600">
                        Uploaded: {new Date(applicant.uploaded_at || '').toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {applicant.match_percentage}%
                      </div>
                      <p className="text-sm text-gray-600">Match Score</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No applications received yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Employees List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Team Members
          </CardTitle>
          <CardDescription>
            Employees who can post jobs on behalf of the company
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((employee) => (
                <div key={employee.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{employee.first_name} {employee.last_name}</h3>
                  <p className="text-sm text-gray-600">{employee.email}</p>
                  <p className="text-sm text-gray-600">@{employee.username}</p>
                  {employee.phone_number && (
                    <p className="text-sm text-gray-600">{employee.phone_number}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No team members found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerDashboard;
