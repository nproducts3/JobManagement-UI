
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { JobSeekerCertification } from '@/types/api';
import { Plus, Edit, Trash2, Award } from 'lucide-react';

interface CertificationsTabProps {
  jobSeekerId?: string;
}

export const CertificationsTab = ({ jobSeekerId }: CertificationsTabProps) => {
  const [certifications, setCertifications] = useState<JobSeekerCertification[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCertification, setEditingCertification] = useState<JobSeekerCertification | null>(null);
  const [certificationName, setCertificationName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (jobSeekerId) {
      fetchCertifications();
    }
  }, [jobSeekerId]);

  const fetchCertifications = async () => {
    try {
      const response = await fetch(`/api/job-seeker-certifications?job_seeker_id=${jobSeekerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCertifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch certifications:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobSeekerId || !certificationName.trim()) return;

    setIsLoading(true);

    try {
      const payload = {
        job_seeker_id: jobSeekerId,
        certification_name: certificationName.trim(),
      };

      const url = editingCertification 
        ? `/api/job-seeker-certifications/${editingCertification.id}`
        : '/api/job-seeker-certifications';
      const method = editingCertification ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const certification = await response.json();
        if (editingCertification) {
          setCertifications(prev => prev.map(cert => 
            cert.id === editingCertification.id ? certification : cert
          ));
        } else {
          setCertifications(prev => [...prev, certification]);
        }
        
        resetForm();
        setIsDialogOpen(false);
        toast({
          title: "Success",
          description: `Certification ${editingCertification ? 'updated' : 'added'} successfully.`,
        });
      } else {
        throw new Error('Failed to save certification');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save certification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (certification: JobSeekerCertification) => {
    setEditingCertification(certification);
    setCertificationName(certification.certification_name || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (certificationId: string) => {
    try {
      const response = await fetch(`/api/job-seeker-certifications/${certificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setCertifications(prev => prev.filter(cert => cert.id !== certificationId));
        toast({
          title: "Success",
          description: "Certification deleted successfully.",
        });
      } else {
        throw new Error('Failed to delete certification');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete certification. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setCertificationName('');
    setEditingCertification(null);
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
          <h2 className="text-2xl font-bold">Certifications</h2>
          <p className="text-gray-600">Add your professional certifications</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingCertification ? 'Edit Certification' : 'Add Certification'}
              </DialogTitle>
              <DialogDescription>
                Add a professional certification you've earned
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="certification_name">Certification Name</Label>
                  <Input
                    id="certification_name"
                    placeholder="e.g., AWS Certified Solutions Architect"
                    value={certificationName}
                    onChange={(e) => setCertificationName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !certificationName.trim()}>
                  {isLoading ? 'Saving...' : 'Save Certification'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Certifications List */}
      <div className="space-y-4">
        {certifications.length > 0 ? (
          certifications.map((certification) => (
            <Card key={certification.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 mt-1 text-gray-500" />
                    <div>
                      <CardTitle className="text-lg">{certification.certification_name}</CardTitle>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(certification)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(certification.id)}
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
              <Award className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No certifications added</h3>
              <p className="text-gray-500 text-center mb-4">
                Add your professional certifications to stand out to employers
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Certification
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
