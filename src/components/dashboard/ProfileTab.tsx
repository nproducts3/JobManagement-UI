
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { JobSeeker } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileTabProps {
  profile: JobSeeker | null;
  onUpdate: (profile: JobSeeker) => void;
}

export const ProfileTab = ({ profile, onUpdate }: ProfileTabProps) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    location: '',
    phone: '',
    desired_salary: '',
    preferred_job_types: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        location: profile.location || '',
        phone: profile.phone || '',
        desired_salary: profile.desired_salary || '',
        preferred_job_types: profile.preferred_job_types || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      const url = profile ? `/api/job-seekers/${profile.id}` : '/api/job-seekers';
      const method = profile ? 'PUT' : 'POST';
      
      const payload = profile ? formData : { ...formData, user_id: user.id };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        onUpdate(updatedProfile);
        toast({
          title: "Success",
          description: "Profile updated successfully.",
        });
      } else {
        throw new Error('Failed to update profile');
      }
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                required
              />
            </div>
          </div>

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
            <Label htmlFor="desired_salary">Desired Salary</Label>
            <Input
              id="desired_salary"
              placeholder="e.g., $80,000 - $100,000"
              value={formData.desired_salary}
              onChange={(e) => handleChange('desired_salary', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred_job_types">Preferred Job Types</Label>
            <Input
              id="preferred_job_types"
              placeholder="e.g., Full-time, Remote, Contract"
              value={formData.preferred_job_types}
              onChange={(e) => handleChange('preferred_job_types', e.target.value)}
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
