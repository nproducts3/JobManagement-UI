
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { JobSeekerExperience } from '@/types/api';
import { Plus, Edit, Trash2, Briefcase } from 'lucide-react';

interface ExperienceTabProps {
  jobSeekerId?: string;
  onNextTab?: () => void;
}

export const ExperienceTab = ({ onNextTab }: ExperienceTabProps) => {
  const [jobSeekerId, setJobSeekerId] = useState<string | null>(null);
  const [experiences, setExperiences] = useState<JobSeekerExperience[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<JobSeekerExperience | null>(null);
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    startDate: '',
    endDate: '',
    responsibilities: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Always fetch latest jobSeekerId from backend
    const fetchJobSeekerId = async () => {
      let latestJobSeekerId = null;
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
      if (latestJobSeekerId) setJobSeekerId(latestJobSeekerId);
    };
    fetchJobSeekerId();
  }, []);

  useEffect(() => {
    if (jobSeekerId) {
      fetchExperiences();
    }
  }, [jobSeekerId]);

  const fetchExperiences = async () => {
    if (!jobSeekerId) return;
    try {
      const response = await fetch(`http://localhost:8080/api/job-seeker-experiences/by-jobseeker?jobSeekerId=${jobSeekerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch experiences');
      const data = await response.json();
      setExperiences(data.map((exp: any) => ({
        id: exp.id,
        jobSeekerId: exp.jobSeekerId,
        jobTitle: exp.jobTitle,
        companyName: exp.companyName,
        startDate: exp.startDate,
        endDate: exp.endDate,
        responsibilities: exp.responsibilities,
      })));
    } catch (error) {
      console.error('Failed to fetch experiences:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobSeekerId) return;

    setIsLoading(true);

    try {
      const responsibilities = formData.responsibilities
        ? formData.responsibilities.split('\n').filter(r => r.trim())
        : [];

      let payload: any = {
        jobSeekerId: jobSeekerId,
        jobTitle: formData.jobTitle,
        companyName: formData.companyName,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        responsibilities: responsibilities,
      };
      if (editingExperience) {
        payload = { ...payload, id: editingExperience.id };
      }

      const url = editingExperience
        ? `http://localhost:8080/api/job-seeker-experiences/${editingExperience.id}`
        : 'http://localhost:8080/api/job-seeker-experiences';
      const method = editingExperience ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const experience: JobSeekerExperience = await response.json();
        if (editingExperience) {
          setExperiences(prev => prev.map(exp =>
            exp.id === editingExperience.id ? experience : exp
          ));
        } else {
          setExperiences(prev => [...prev, experience]);
        }

        resetForm();
        setIsDialogOpen(false);
        toast({
          title: "Success",
          description: `Experience ${editingExperience ? 'updated' : 'added'} successfully.`,
        });
        if (onNextTab) onNextTab();
      } else {
        throw new Error('Failed to save experience');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save experience. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (experience: JobSeekerExperience) => {
    setEditingExperience(experience);
    setFormData({
      jobTitle: experience.jobTitle || '',
      companyName: experience.companyName || '',
      startDate: experience.startDate || '',
      endDate: experience.endDate || '',
      responsibilities: Array.isArray(experience.responsibilities)
        ? experience.responsibilities.join('\n')
        : '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (experienceId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/job-seeker-experiences/${experienceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setExperiences(prev => prev.filter(exp => exp.id !== experienceId));
        toast({
          title: "Success",
          description: "Experience deleted successfully.",
        });
      } else {
        throw new Error('Failed to delete experience');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete experience. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      jobTitle: '',
      companyName: '',
      startDate: '',
      endDate: '',
      responsibilities: '',
    });
    setEditingExperience(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Work Experience</h2>
          <p className="text-gray-600">Add your professional experience</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {editingExperience ? 'Edit Experience' : 'Add Experience'}
              </DialogTitle>
              <DialogDescription>
                Add details about your work experience
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      placeholder="Leave empty if current"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Responsibilities</Label>
                  <Textarea
                    id="responsibilities"
                    placeholder="Enter each responsibility on a new line"
                    value={formData.responsibilities}
                    onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value }))}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Experience'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Experiences List */}
      <div className="space-y-4">
        {experiences.length > 0 ? (
          experiences.map((experience) => (
            <Card key={experience.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 mt-1 text-gray-500" />
                    <div>
                      <CardTitle className="text-lg">{experience.jobTitle}</CardTitle>
                      <CardDescription className="text-base">
                        {experience.companyName}
                      </CardDescription>
                      <p className="text-sm text-gray-500 mt-1">
                          {experience.startDate} - {experience.endDate || 'Present'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(experience)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(experience.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {experience.responsibilities && Array.isArray(experience.responsibilities) && (
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1">
                    {experience.responsibilities.map((responsibility, index) => (
                      <li key={index} className="text-sm">{responsibility}</li>
                    ))}
                  </ul>
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No work experience added</h3>
              <p className="text-gray-500 text-center mb-4">
                Add your work experience to showcase your professional background
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Experience
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
