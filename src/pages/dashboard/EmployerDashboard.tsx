import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Briefcase, Users, TrendingUp, Star, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import JobPostingsTab from '@/components/dashboard/JobPostings';
import CandidatesTab from '@/components/dashboard/CandidatesTab';
import AnalyticsTab from '@/components/dashboard/AnalyticsTab';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // New state for recent jobs and jobseekers
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentJobseekers, setRecentJobseekers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch latest 2 jobs
    const fetchRecentJobs = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/google-jobs?page=0&size=10', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const jobsArray = Array.isArray(data.content) ? data.content : [];
          const sortedJobs = jobsArray.sort((a, b) => {
            const dateA = new Date(a.createdDateTime || a.postedAt || 0);
            const dateB = new Date(b.createdDateTime || b.postedAt || 0);
            return dateB.getTime() - dateA.getTime();
          });
          setRecentJobs(sortedJobs.slice(0, 2));
        }
      } catch (error) {
        console.error('Failed to fetch recent jobs:', error);
      }
    };
    // Fetch latest 2 jobseekers
    const fetchRecentJobseekers = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/users/jobseekers', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const users = await response.json();
          setRecentJobseekers(users.slice(0, 2));
        }
      } catch (error) {
        console.error('Failed to fetch jobseekers:', error);
      }
    };
    fetchRecentJobs();
    fetchRecentJobseekers();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'job-postings', label: 'Job Postings' },
    { id: 'candidates', label: 'Candidates' },
    { id: 'analytics', label: 'Analytics' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'job-postings':
        return <JobPostingsTab />;
      case 'candidates':
        return <CandidatesTab />;
      case 'analytics':
        return <AnalyticsTab />;
      default:
        return (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Job Postings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Job Postings</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('job-postings')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentJobs.length === 0 ? (
                    <div className="text-gray-500">No recent jobs found.</div>
                  ) : (
                    recentJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{job.title}</h4>
                            <p className="text-sm text-gray-600">{job.companyName} • {job.location}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span>{job.scheduleType || 'Full-time'}</span>
                          {job.salary && <span>{job.salary}</span>}
                          <span>{job.createdDateTime ? new Date(job.createdDateTime).toLocaleDateString() : ''}</span>
                      </div>
                      <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/google-jobs/${job.id}`)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Recent Candidates */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Candidates</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('candidates')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentJobseekers.length === 0 ? (
                    <div className="text-gray-500">No recent candidates found.</div>
                  ) : (
                    recentJobseekers.map((candidate) => (
                    <div key={candidate.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {candidate.firstName?.[0]?.toUpperCase()}{candidate.lastName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{candidate.firstName} {candidate.lastName}</p>
                            <p className="text-xs text-gray-500">{candidate.email}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Profile
                      </Button>
                    </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
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
            <Button 
              className="bg-black hover:bg-gray-800 text-white"
              onClick={() => navigate('/post-job')}
            >
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
                  <p className="text-2xl font-bold">81</p>
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
                  <p className="text-2xl font-bold">548</p>
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
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default EmployeeDashboard;