
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { JobSeekerEducation } from '@/types/api';
import { Plus, Edit, Trash2, GraduationCap } from 'lucide-react';

interface EducationTabProps {
  jobSeekerId?: string;
  onNextTab?: () => void;
}

export const EducationTab = ({ onNextTab }: EducationTabProps) => {
  const [jobSeekerId, setJobSeekerId] = useState<string | null>(null);
  const [educations, setEducations] = useState<JobSeekerEducation[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<JobSeekerEducation | null>(null);
  const [formData, setFormData] = useState({
    degree: '',
    university: '',
    graduation_year: '',
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
      fetchEducations();
    }
  }, [jobSeekerId]);

  const fetchEducations = async () => {
    if (!jobSeekerId) return;
    try {
      const response = await fetch(`http://localhost:8080/api/job-seeker-educations/by-jobseeker?jobSeekerId=${jobSeekerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch educations');
      const data = await response.json();
      setEducations(data);
    } catch (error) {
      console.error('Failed to fetch educations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobSeekerId) return;

    setIsLoading(true);

    try {
      const payload = {
        jobSeekerId: jobSeekerId,
        degree: formData.degree,
        university: formData.university,
        graduationYear: formData.graduation_year ? parseInt(formData.graduation_year) : null,
      };

      const url = editingEducation 
        ? `http://localhost:8080/api/job-seeker-educations/${editingEducation.id}`
        : 'http://localhost:8080/api/job-seeker-educations';
      const method = editingEducation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const education = await response.json();
        if (editingEducation) {
          setEducations(prev => prev.map(edu => 
            edu.id === editingEducation.id ? education : edu
          ));
        } else {
          setEducations(prev => [...prev, education]);
        }
        
        resetForm();
        setIsDialogOpen(false);
        toast({
          title: "Success",
          description: `Education ${editingEducation ? 'updated' : 'added'} successfully.`,
        });
        if (onNextTab) onNextTab();
      } else {
        throw new Error('Failed to save education');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save education. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (education: JobSeekerEducation) => {
    setEditingEducation(education);
    setFormData({
      degree: education.degree || '',
      university: education.university || '',
      graduation_year: education.graduationYear?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (educationId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/job-seeker-educations/${educationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setEducations(prev => prev.filter(edu => edu.id !== educationId));
        toast({
          title: "Success",
          description: "Education deleted successfully.",
        });
      } else {
        throw new Error('Failed to delete education');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete education. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      degree: '',
      university: '',
      graduation_year: '',
    });
    setEditingEducation(null);
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
          <h2 className="text-2xl font-bold">Education</h2>
          <p className="text-gray-600">Add your educational background</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingEducation ? 'Edit Education' : 'Add Education'}
              </DialogTitle>
              <DialogDescription>
                Add details about your educational background
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree</Label>
                  <Input
                    id="degree"
                    placeholder="e.g., Bachelor of Science in Computer Science"
                    value={formData.degree}
                    onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university">University/Institution</Label>
                  <Input
                    id="university"
                    placeholder="e.g., Stanford University"
                    value={formData.university}
                    onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduation_year">Graduation Year</Label>
                  <Input
                    id="graduation_year"
                    type="number"
                    placeholder="e.g., 2020"
                    min="1950"
                    max="2030"
                    value={formData.graduation_year}
                    onChange={(e) => setFormData(prev => ({ ...prev, graduation_year: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Education'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Education List */}
      <div className="space-y-4">
        {educations.length > 0 ? (
          educations.map((education) => (
            <Card key={education.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 mt-1 text-gray-500" />
                    <div>
                      <CardTitle className="text-lg">{education.degree}</CardTitle>
                      <CardDescription className="text-base">
                        {education.university}
                      </CardDescription>
                      {education.graduationYear && (
                        <p className="text-sm text-gray-500 mt-1">
                          Graduated: {education.graduationYear}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(education)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(education.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GraduationCap className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No education added</h3>
              <p className="text-gray-500 text-center mb-4">
                Add your educational background to enhance your profile
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Education
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
