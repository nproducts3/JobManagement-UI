import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { JobResume } from '@/types/api';
import { Upload, FileText, Download, Trash2, UploadCloud } from 'lucide-react';

interface ResumeTabProps {
  jobSeekerId?: string;
}

type UploadState = 'idle' | 'uploading' | 'uploaded' | 'error';

export const ResumeTab = ({ jobSeekerId }: ResumeTabProps) => {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [resume, setResume] = useState<JobResume | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (jobSeekerId) {
      fetchLatestResume();
    }
  }, [jobSeekerId]);

  const fetchLatestResume = async () => {
    try {
      const response = await fetch(`/api/job-resumes?job_seeker_id=${jobSeekerId}&latest=true`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setResume(data);
          setUploadState('uploaded');
        } else {
          setUploadState('idle');
        }
      } else {
        setUploadState('idle');
      }
    } catch (error) {
      console.error('Failed to fetch resume:', error);
      setUploadState('idle');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

      const formData = new FormData();
      formData.append('file', file);
    formData.append('googlejob_id', 'user_profile_resume');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/job-resumes', true);
    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        setProgress(percentComplete);
      }
    };
    
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        const newResume = JSON.parse(xhr.responseText);
        setResume(newResume);
        setUploadState('uploaded');
        toast({
          title: "Success",
          description: "Resume uploaded successfully.",
        });
      } else {
        setUploadState('error');
        toast({
          title: "Error",
          description: "Failed to upload resume. Please try again.",
          variant: "destructive",
        });
      }
    };

    xhr.onerror = () => {
      setUploadState('error');
      toast({
        title: "Error",
        description: "An unexpected error occurred during upload.",
        variant: "destructive",
      });
    };

    setUploadState('uploading');
    setProgress(0);
    xhr.send(formData);
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
        toast({
          title: "Success",
          description: "Resume deleted successfully.",
        });
        fetchLatestResume();
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
      <Card>
        <CardHeader>
          <CardTitle>Resume</CardTitle>
          <CardDescription>
            Your resume is the first impression you make on potential employers. 
            Craft it carefully to secure your desired job or internship.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadState === 'idle' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Upload your resume</h3>
              <p className="mt-1 text-sm text-gray-500">Supported formats: doc, docx, rtf, pdf, up to 2MB</p>
              <div className="mt-6">
                <Button onClick={() => document.getElementById('resume-upload-input')?.click()}>
                  Upload resume
                </Button>
              </div>
            </div>
          )}

          {uploadState === 'uploading' && (
            <div className="p-8 text-center">
              <p className="text-lg font-medium">Uploading your resume...</p>
              <Progress value={progress} className="mt-4" />
              <p className="mt-2 text-sm text-gray-500">{Math.round(progress)}%</p>
              </div>
            )}

          {(uploadState === 'uploaded' || uploadState === 'error') && resume && (
      <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-gray-500" />
                  <div>
                    <p className="font-medium">{resume.resume_file}</p>
                    <p className="text-sm text-gray-500">
                      Uploaded on {new Date(resume.uploaded_at || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                  <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleDownload(resume)}>
                    <Download className="h-5 w-5" />
                    </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(resume.id)}>
                    <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={() => document.getElementById('resume-upload-input')?.click()}>
                  Update resume
                </Button>
              </div>
                  </div>
          )}

          {/* Hidden file input */}
          <input
            id="resume-upload-input"
            type="file"
            accept=".pdf,.doc,.docx,.rtf"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
            </CardContent>
          </Card>

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
