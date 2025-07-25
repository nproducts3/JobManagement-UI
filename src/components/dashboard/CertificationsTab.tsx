
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { JobSeekerCertification } from '@/types/api';
import { Plus, Edit, Trash2, Award } from 'lucide-react';
import { certificationsService } from '@/services/certificationsService';

interface CertificationsTabProps {
  jobSeekerId?: string;
  onNextTab?: () => void;
}

export const CertificationsTab = ({ jobSeekerId, onNextTab }: CertificationsTabProps) => {
  const [certifications, setCertifications] = useState<JobSeekerCertification[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCertification, setEditingCertification] = useState<JobSeekerCertification | null>(null);
  const [certificationName, setCertificationName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (jobSeekerId) {
      fetchCertifications();
    }
  }, [jobSeekerId]);

  const fetchCertifications = async () => {
    if (!jobSeekerId) return;
    try {
      const response = await fetch(`http://localhost:8080/api/job-seeker-certifications/job-seeker/${jobSeekerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch certifications');
      const data = await response.json();
      setCertifications(data);
    } catch (error) {
      console.error('Failed to fetch certifications:', error);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  // Handle form submit for create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // setError(null); // This state variable is not defined in the original file
    try {
      const formData = new FormData();
      formData.append('jobSeekerId', jobSeekerId);
      formData.append('certificationName', certificationName.trim());
      if (file) formData.append('file', file);
      let result;
      if (editingCertification) {
        result = await certificationsService.updateCertificationWithFile(editingCertification.id, formData);
      } else {
        result = await certificationsService.uploadCertification(formData);
      }
      // ... refresh list, reset form, etc.
      setFile(null);
      setCertificationName('');
      setEditingCertification(null);
      fetchCertifications();
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: `Certification ${editingCertification ? 'updated' : 'added'} successfully.`,
      });
      if (onNextTab) onNextTab();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save certification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (certification: JobSeekerCertification) => {
    setEditingCertification(certification);
    setCertificationName(certification.certificationName || '');
    setIsDialogOpen(true);  
  };

  const handleDelete = async (certificationId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/job-seeker-certifications/${certificationId}`, {
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
                <div className="space-y-2">
                  <Label htmlFor="certification_file">Certification File</Label>
                  <Input
                    type="file"
                    id="certification_file"
                    accept=".pdf,.jpg,.png,.jpeg"
                    onChange={handleFileChange}
                  />
                  {file && <span className="text-xs text-gray-600">{file.name}</span>}
                  {/* Show uploaded file if editing */}
                  {editingCertification && editingCertification.certificationFile && (
                    <a href={`http://localhost:8080/uploads/certifications/${editingCertification.certificationFile}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-2">Download File</a>
                  )}
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
                      <CardTitle className="text-lg">{certification.certificationName}</CardTitle>
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
