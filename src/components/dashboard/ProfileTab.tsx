import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { JobSeeker } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { jobSeekerService, JobSeekerData } from '@/services/jobSeekerService';

interface ProfileTabProps {
  onUpdate: (profile: JobSeeker) => void;
  onNextTab?: () => void;
}



export const ProfileTab = ({ onUpdate, onNextTab }: ProfileTabProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<JobSeekerData | null>(null);
  const [jobSeekerId, setJobSeekerId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    location: '',
    phone: '',
    desiredSalary: '',
    preferredJobTypes: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch the jobseeker profile for the authenticated user
  useEffect(() => {
    const fetchProfile = async () => {
      // Always fetch jobSeekerId from /api/job-seekers/me/id for the current user
      let latestJobSeekerId = user?.jobSeekerId;
      if (!latestJobSeekerId) {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const res = await fetch('http://localhost:8080/api/job-seekers/me/id', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              latestJobSeekerId = await res.text();
            }
          }
        } catch {}
      }
      if (!latestJobSeekerId) return;
      setJobSeekerId(latestJobSeekerId);
      try {
        const js = await jobSeekerService.getById(latestJobSeekerId);
        setProfile(js);
        setFormData({
          firstName: js.firstName || user.firstName || '',
          lastName: js.lastName || user.lastName || '',
          location: js.location || '',
          phone: js.phone || '',
          desiredSalary: js.desiredSalary || '',
          preferredJobTypes: js.preferredJobTypes || '',
        });
      } catch {
        setProfile(null);
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          location: '',
          phone: '',
          desiredSalary: '',
          preferredJobTypes: '',
        });
      }
    };
    fetchProfile();
  }, [user]);
// Removed duplicate state and hook declarations below. All state and hooks are now declared only once at the top.


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      let updatedProfile: JobSeekerData;
      if (jobSeekerId && profile) {
        updatedProfile = await jobSeekerService.update(jobSeekerId, {
          id: jobSeekerId,
          userId: profile.userId,
          firstName: formData.firstName || profile.firstName,
          lastName: formData.lastName || profile.lastName,
          location: formData.location,
          phone: formData.phone,
          desiredSalary: formData.desiredSalary,
          preferredJobTypes: formData.preferredJobTypes,
        });
      } else {
        toast({
          title: "Error",
          description: "Profile not found. Cannot update.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      // Convert JobSeekerData to JobSeeker for the callback
      const jobSeekerForCallback: JobSeeker = {
        id: updatedProfile.id || '',
        user: user,
        firstName: user.firstName,
        lastName: user.lastName,
        location: updatedProfile.location,
        phone: updatedProfile.phone,
        desiredSalary: updatedProfile.desiredSalary,
        preferredJobTypes: updatedProfile.preferredJobTypes,
      };
      setProfile(updatedProfile);
      onUpdate(jobSeekerForCallback);
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
      if (onNextTab) onNextTab();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your personal details to help employers find you
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Display logged-in user info */}
        {user && (
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* <div>
                <Label>User ID</Label>
                <Input value={user.id} readOnly className="bg-gray-100" />
              </div> */}
              <div>
                <Label>First Name</Label>
                <Input value={user.firstName} readOnly className="bg-gray-100" />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={user.lastName} readOnly className="bg-gray-100" />
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                readOnly
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                readOnly
                required
              />
            </div>
          </div> */}

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="City, State"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desiredSalary">Desired Salary</Label>
            <Input
              id="desiredSalary"
              placeholder="e.g., $80,000 - $100,000"
              value={formData.desiredSalary}
              onChange={(e) => handleChange('desiredSalary', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredJobTypes">Preferred Job Types</Label>
            <Input
              id="preferredJobTypes"
              placeholder="e.g., Full-time, Remote, Contract"
              value={formData.preferredJobTypes}
              onChange={(e) => handleChange('preferredJobTypes', e.target.value)}
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
