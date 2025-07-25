
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ProfileTab } from '@/components/dashboard/ProfileTab';
import { SkillsTab } from '@/components/dashboard/SkillsTab';
import { ExperienceTab } from '@/components/dashboard/ExperienceTab';
import { EducationTab } from '@/components/dashboard/EducationTab';
import { CertificationsTab } from '@/components/dashboard/CertificationsTab';
import { ResumeTab } from '@/components/dashboard/ResumeTab';
import { User, FileText, Award, GraduationCap, Briefcase, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { JobSeeker } from '@/types/api';
import { jobSeekerService } from '@/services/jobSeekerService';

import { ResumeAnalysisProvider } from '@/contexts/ResumeAnalysisContext';

const JobSeekerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<JobSeeker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (user?.id) {
        const data = await jobSeekerService.getByUserId(user.id);
        if (data.length > 0) {
          const jobSeekerData = data[0];
          const jobSeeker: JobSeeker = {
            id: jobSeekerData.id || '',
            user: user, // from AuthContext
            firstName: jobSeekerData.firstName || '',
            lastName: jobSeekerData.lastName || '',
            location: jobSeekerData.location,
            phone: jobSeekerData.phone,
            desiredSalary: jobSeekerData.desiredSalary,
            preferredJobTypes: jobSeekerData.preferredJobTypes,
          };
          setProfile(jobSeeker);
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <ResumeAnalysisProvider>
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Job Seeker Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user?.firstName} {user?.lastName}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button onClick={() => navigate('/google-jobs')}>Find Jobs</Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Completion</p>
                  <p className="text-2xl font-bold">85%</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Applications</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Interviews</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resume Views</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <Briefcase className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab onUpdate={setProfile} onNextTab={() => setActiveTab('skills')} />
          </TabsContent>

          <TabsContent value="skills">
            <SkillsTab jobSeekerId={profile?.id} onNextTab={() => setActiveTab('experience')} />
          </TabsContent>

          <TabsContent value="experience">
            <ExperienceTab jobSeekerId={profile?.id} onNextTab={() => setActiveTab('education')} />
          </TabsContent>

          <TabsContent value="education">
            <EducationTab jobSeekerId={profile?.id} onNextTab={() => setActiveTab('certifications')} />
          </TabsContent>

          <TabsContent value="certifications">
            <CertificationsTab jobSeekerId={profile?.id} onNextTab={() => setActiveTab('resume')} />
          </TabsContent>

          <TabsContent value="resume">
            <ResumeTab jobSeekerId={profile?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </ResumeAnalysisProvider>
  );
};

export default JobSeekerDashboard;
