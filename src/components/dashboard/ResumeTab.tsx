
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { JobResume } from '@/types/api';
import { Upload, FileText, Download, Trash2 } from 'lucide-react';

interface ResumeTabProps {
  jobSeekerId?: string;
}

export const ResumeTab = ({ jobSeekerId }: ResumeTabProps) => {
  const [resumes, setResumes] = useState<JobResume[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (jobSeekerId) {
      fetchResumes();
    }
  }, [jobSeekerId]);

  const fetchResumes = async () => {
    try {
      const response = await fetch(`/api/job-resumes?job_seeker_id=${jobSeekerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setResumes(data);
      }
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !jobSeekerId) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please upload a PDF or Word document.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('googlejob_id', 'default'); // This would need to be set based on which job they're applying to

      const response = await fetch('/api/job-resumes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      if (response.ok) {
        const resume = await response.json();
        setResumes(prev => [...prev, resume]);
        toast({
          title: "Success",
          description: "Resume uploaded successfully.",
        });
        
        // Reset file input
        event.target.value = '';
      } else {
        throw new Error('Failed to upload resume');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (resumeId: string) => {
    try {
      const response = await fetch(`/api/job-resumes/${resumeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setResumes(prev => prev.filter(resume => resume.id !== resumeId));
        toast({
          title: "Success",
          description: "Resume deleted successfully.",
        });
      } else {
        throw new Error('Failed to delete resume');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (resume: JobResume) => {
    // This would typically download the file from the server
    toast({
      title: "Download",
      description: "Resume download would be implemented with proper file storage.",
    });
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Resume Management</h2>
          <p className="text-gray-600">Upload and manage your resumes</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Resume</CardTitle>
          <CardDescription>
            Upload your resume to apply for jobs and get ATS matching scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resume-upload">Select Resume File</Label>
              <Input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <p className="text-sm text-gray-500">
                Supported formats: PDF, DOC, DOCX (Max 5MB)
              </p>
            </div>
            
            {isUploading && (
              <div className="flex items-center gap-2">
                <Progress value={50} className="flex-1" />
                <span className="text-sm text-gray-500">Uploading...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumes List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Your Resumes</h3>
        
        {resumes.length > 0 ? (
          resumes.map((resume) => (
            <Card key={resume.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <FileText className="h-6 w-6 mt-1 text-gray-500" />
                    <div className="flex-1">
                      <CardTitle className="text-lg">{resume.resume_file}</CardTitle>
                      <CardDescription>
                        Uploaded: {new Date(resume.uploaded_at || '').toLocaleDateString()}
                      </CardDescription>
                      
                      {/* ATS Match Score */}
                      {resume.match_percentage !== undefined && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">ATS Match Score</span>
                            <span className={`text-sm font-bold ${getMatchColor(resume.match_percentage)}`}>
                              {resume.match_percentage.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={resume.match_percentage} className="h-2" />
                          <p className="text-xs text-gray-500">
                            {resume.match_percentage >= 80 ? 'Excellent match!' :
                             resume.match_percentage >= 60 ? 'Good match' :
                             'Consider optimizing your resume'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(resume)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(resume.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {resume.resume_text && (
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Extracted Text Preview</h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {resume.resume_text.substring(0, 200)}...
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No resumes uploaded</h3>
              <p className="text-gray-500 text-center mb-4">
                Upload your resume to start applying for jobs and get ATS matching scores
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ATS Tips */}
      <Card>
        <CardHeader>
          <CardTitle>ATS Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• Use keywords from the job description</li>
            <li>• Include relevant technical skills</li>
            <li>• Use standard section headings (Experience, Education, Skills)</li>
            <li>• Avoid complex formatting, images, or graphics</li>
            <li>• Use common file formats (PDF or Word)</li>
            <li>• Include specific achievements with numbers when possible</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
