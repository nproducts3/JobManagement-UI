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
import { resumeService } from '@/services/resumeService';

interface ResumeTabProps {
  jobSeekerId?: string;
}

type UploadState = 'idle' | 'uploading' | 'uploaded' | 'error';

export const ResumeTab = ({ jobSeekerId }: ResumeTabProps) => {
  // Remove all CRUD resume state and handlers
  // Only keep state for analysis results
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [topMatches, setTopMatches] = useState<any[]>([]);
  const [skillsExtracted, setSkillsExtracted] = useState<any>(null);
  const { toast } = useToast();

  // Handle file upload and analysis
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !jobSeekerId) return;
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const analysis = await resumeService.analyzeResume(file, jobSeekerId);
      setResumeAnalysis(analysis);
      // Store extracted skills and text in localStorage for cross-page access
      if (analysis && analysis.extractedSkills) {
        localStorage.setItem('resumeSkills', JSON.stringify(analysis.extractedSkills));
      }
      if (analysis && analysis.resumeText) {
        localStorage.setItem('resumeText', analysis.resumeText);
      }
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to analyze resume');
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Handle resume text analysis (top matches)
  const handleAnalyzeText = async () => {
    if (!resumeText) return;
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const matches = await resumeService.getTopMatches(resumeText, 10);
      setTopMatches(matches);
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to get top matches');
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Handle skill extraction
  const handleExtractSkills = async () => {
    if (!resumeText) return;
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const skills = await resumeService.extractSkills(resumeText);
      setSkillsExtracted(skills);
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to extract skills');
    } finally {
      setAnalysisLoading(false);
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
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Resume</CardTitle>
          <CardDescription>
            Your resume is the first impression you make on potential employers. Craft it carefully to secure your desired job or internship.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Resume Upload UI */}
          <div className="mb-4">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              id="resume-upload-input"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <Button onClick={() => document.getElementById('resume-upload-input')?.click()}>
              Upload Resume
            </Button>
          </div>
          {analysisLoading && (
            <div className="my-4 text-blue-600">Analyzing resume, please wait...</div>
          )}
          {analysisError && (
            <div className="my-4 text-red-600">{analysisError}</div>
          )}
          {/* Analysis Results */}
          {resumeAnalysis && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Job Match Analysis</h3>
              {resumeAnalysis.matches && resumeAnalysis.matches.length > 0 ? (
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1">Job Title</th>
                      <th className="border px-2 py-1">Company</th>
                      <th className="border px-2 py-1">Match %</th>
                      <th className="border px-2 py-1">Matched Skills</th>
                      <th className="border px-2 py-1">Missing Skills</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumeAnalysis.matches.map((match: any, idx: number) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{match.jobTitle}</td>
                        <td className="border px-2 py-1">{match.companyName}</td>
                        <td className="border px-2 py-1">{match.matchPercentage}%</td>
                        <td className="border px-2 py-1">{(match.matchedSkills || []).join(', ')}</td>
                        <td className="border px-2 py-1">{(match.missingSkills || []).join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div>No job matches found.</div>
              )}
              {/* Summary Section */}
              {resumeAnalysis.summary && (
                <div className="mt-4 p-2 bg-gray-50 rounded">
                  <h4 className="font-medium mb-1">Summary</h4>
                  <pre className="whitespace-pre-wrap text-xs">{resumeAnalysis.summary}</pre>
                </div>
              )}
            </div>
          )}
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
