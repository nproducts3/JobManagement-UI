
// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { useToast } from '@/hooks/use-toast';
// import { useAuth } from '@/contexts/AuthContext';
// import { Organization, JobResume, User } from '@/types/api';
// import { Building2, Users, FileText, Plus } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// const EmployerDashboard = () => {
//   const [organization, setOrganization] = useState<Organization | null>(null);
//   const [applicants, setApplicants] = useState<JobResume[]>([]);
//   const [employees, setEmployees] = useState<User[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const { toast } = useToast();
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (user?.organization_id) {
//       fetchOrganization();
//       fetchApplicants();
//       fetchEmployees();
//     }
//   }, [user]);

//   const fetchOrganization = async () => {
//     try {
//       const response = await fetch(`http://localhost:8080/api/organizations/${user?.organization_id}`, {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setOrganization(data);
//       }
//     } catch (error) {
//       console.error('Failed to fetch organization:', error);
//     }
//   };

//   const fetchApplicants = async () => {
//     try {
//       const response = await fetch('http://localhost:8080/api/job-resumes', {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setApplicants(data);
//       }
//     } catch (error) {
//       console.error('Failed to fetch applicants:', error);
//     }
//   };

//   const fetchEmployees = async () => {
//     try {
//       const response = await fetch(`http://localhost:8080/api/users?organization_id=${user?.organization_id}`, {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setEmployees(data.filter((emp: User) => emp.id !== user?.id));
//       }
//     } catch (error) {
//       console.error('Failed to fetch employees:', error);
//     }
//   };

//   const updateOrganization = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!organization) return;

//     setIsLoading(true);
//     try {
//       const response = await fetch(`http://localhost:8080/api/organizations/${organization.id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         },
//         body: JSON.stringify(organization),
//       });

//       if (response.ok) {
//         toast({
//           title: "Success",
//           description: "Organization updated successfully.",
//         });
//       } else {
//         throw new Error('Failed to update organization');
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to update organization. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 space-y-8">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold">Employer Dashboard</h1>
//         <Button onClick={() => navigate('/post-job')}>
//           <Plus className="h-4 w-4 mr-2" />
//           Post New Job
//         </Button>
//       </div>

//       {/* Organization Management */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center">
//             <Building2 className="h-5 w-5 mr-2" />
//             Company Information
//           </CardTitle>
//           <CardDescription>
//             Manage your organization details
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {organization && (
//             <form onSubmit={updateOrganization} className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="name">Company Name</Label>
//                   <Input
//                     id="name"
//                     value={organization.name || ''}
//                     onChange={(e) => setOrganization(prev => prev ? {...prev, name: e.target.value} : null)}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="domain">Domain</Label>
//                   <Input
//                     id="domain"
//                     value={organization.domain}
//                     onChange={(e) => setOrganization(prev => prev ? {...prev, domain: e.target.value} : null)}
//                   />
//                 </div>
//               </div>
//               <div>
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   id="description"
//                   value={organization.description}
//                   onChange={(e) => setOrganization(prev => prev ? {...prev, description: e.target.value} : null)}
//                   rows={3}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="logo_img_src">Logo URL</Label>
//                 <Input
//                   id="logo_img_src"
//                   value={organization.logo_img_src || ''}
//                   onChange={(e) => setOrganization(prev => prev ? {...prev, logo_img_src: e.target.value} : null)}
//                 />
//               </div>
//               <Button type="submit" disabled={isLoading}>
//                 Update Organization
//               </Button>
//             </form>
//           )}
//         </CardContent>
//       </Card>

//       {/* Applicants Overview */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center">
//             <FileText className="h-5 w-5 mr-2" />
//             Resume Applications
//           </CardTitle>
//           <CardDescription>
//             View applicants and their resume match percentages
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {applicants.length > 0 ? (
//             <div className="space-y-4">
//               {applicants.map((applicant) => (
//                 <div key={applicant.id} className="border rounded-lg p-4">
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <h3 className="font-semibold">Resume: {applicant.resume_file}</h3>
//                       <p className="text-sm text-gray-600">Job ID: {applicant.googlejob_id}</p>
//                       <p className="text-sm text-gray-600">
//                         Uploaded: {new Date(applicant.uploaded_at || '').toLocaleDateString()}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <div className="text-2xl font-bold text-green-600">
//                         {applicant.match_percentage}%
//                       </div>
//                       <p className="text-sm text-gray-600">Match Score</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-gray-500">No applications received yet.</p>
//           )}
//         </CardContent>
//       </Card>

//       {/* Employees List */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center">
//             <Users className="h-5 w-5 mr-2" />
//             Team Members
//           </CardTitle>
//           <CardDescription>
//             Employees who can post jobs on behalf of the company
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {employees.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {employees.map((employee) => (
//                 <div key={employee.id} className="border rounded-lg p-4">
//                   <h3 className="font-semibold">{employee.first_name} {employee.last_name}</h3>
//                   <p className="text-sm text-gray-600">{employee.email}</p>
//                   <p className="text-sm text-gray-600">@{employee.username}</p>
//                   {employee.phone_number && (
//                     <p className="text-sm text-gray-600">{employee.phone_number}</p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-gray-500">No team members found.</p>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default EmployerDashboard;



import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, Briefcase, FileText, Settings, Eye, Users, TrendingUp, Star, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { user } = useAuth();
     const navigate = useNavigate();

  const jobPostings = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$120,000 - $150,000',
      posted: 'Posted May 20, 2025',
      applicants: 27,
      views: 186,
      status: 'active'
    },
    {
      id: '2',
      title: 'Marketing Manager',
      department: 'Engineering',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$80,000 - $100,000',
      posted: 'Posted May 22, 2025',
      applicants: 12,
      views: 184,
      status: 'active'
    },
    {
      id: '3',
      title: 'UI/UX Designer',
      department: 'Engineering',
      location: 'Austin, TX',
      type: 'Full-time',
      salary: '$90,000 - $120,000',
      posted: 'Posted May 25, 2025',
      applicants: 32,
      views: 205,
      status: 'paused'
    }
  ];

  const candidates = [
    {
      id: '1',
      name: 'Sarah Johnson',
      position: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      experience: '4 years',
      match: 95,
      status: 'new',
      initials: 'SJ',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS']
    },
    {
      id: '2',
      name: 'Michael Chen',
      position: 'Full Stack Developer',
      location: 'Remote',
      experience: '6 years',
      match: 88,
      status: 'reviewing',
      initials: 'MC',
      skills: ['JavaScript', 'Python', 'Docker', 'PostgreSQL']
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      position: 'Product Manager',
      location: 'Austin, TX',
      experience: '5 years',
      match: 92,
      status: 'interview',
      initials: 'ER',
      skills: ['Product Strategy', 'Agile', 'Analytics', 'User Research']
    }
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      new: 'bg-blue-100 text-blue-800',
      reviewing: 'bg-yellow-100 text-yellow-800',
      interview: 'bg-purple-100 text-purple-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Employer Dashboard</h1>
            <p className="text-gray-600">
              Manage your job postings and candidates
            </p>
          </div>
          <div className="flex gap-3">
          <Button onClick={() => navigate('/post-job')}>
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% from last month
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold">79</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% from last week
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Views</p>
                  <p className="text-2xl font-bold">547</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15% from last week
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Match Score</p>
                  <p className="text-2xl font-bold">87%</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +3% from last month
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button className="px-4 py-2 text-gray-500 hover:text-gray-700">Overview</button>
          <button className="px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-medium">Job Postings</button>
          <button className="px-4 py-2 text-gray-500 hover:text-gray-700">Candidates</button>
          <button className="px-4 py-2 text-gray-500 hover:text-gray-700">Analytics</button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Job Postings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Job Postings</CardTitle>
              </div>
              <Button variant="ghost" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobPostings.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.department} • {job.location}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(job.status)}`}>
                          {job.status}
                        </span>
                        <Button variant="ghost" size="sm">
                          •••
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>{job.type}</span>
                      <span>{job.salary}</span>
                      <span>{job.posted}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{job.applicants} applicants</span>
                      <span>•</span>
                      <span>{job.views} views</span>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Users className="h-4 w-4 mr-1" />
                        Candidates
                      </Button>
                      <Button variant="ghost" size="sm">
                        Apply for Candidate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Candidates */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Candidates</CardTitle>
              </div>
              <Button variant="ghost" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {candidate.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{candidate.name}</p>
                        <p className="text-xs text-gray-500">{candidate.position}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{candidate.match}% Match</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(candidate.status)}`}>
                            {candidate.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Profile
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;