import { useState, useEffect } from 'react';
import { useResumeAnalysis, JobMatch } from '@/contexts/ResumeAnalysisContext';
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
import { useAuth } from '@/contexts/AuthContext';

interface ResumeTabProps {
  jobSeekerId?: string;
}



interface ResumeAnalysisResponse {
  resumeId: string;
  resumeFile: string;
  resumeText: string;
  uploadedAt: string;
  jobSeekerId: string;
  jobSeekerName: string;
  extractedSkills: string[];
  skillsByCategory: Record<string, string[]>;
  jobMatches: JobMatch[];
  averageMatchPercentage: number;
  totalJobsAnalyzed: number;
  highMatchJobs: number;
  mediumMatchJobs: number;
  lowMatchJobs: number;
}

type UploadState = 'idle' | 'uploading' | 'uploaded' | 'error';

export const ResumeTab = ({ jobSeekerId }: ResumeTabProps) => {
  const { resumeAnalysisData, setResumeAnalysisData } = useResumeAnalysis();

  // Restore resume analysis from localStorage if context is empty
  useEffect(() => {
    if (!resumeAnalysisData?.jobMatches?.length) {
      const stored = localStorage.getItem('resumeAnalysisData');
      if (stored) {
        try {
          setResumeAnalysisData(JSON.parse(stored));
        } catch {}
      }
    }
  }, []);

  // Remove all CRUD resume state and handlers
  // Only keep state for analysis results
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysisResponse | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [topMatches, setTopMatches] = useState<JobMatch[]>([]);
  const [skillsExtracted, setSkillsExtracted] = useState<string[] | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // No need to fetch or set jobSeekerId internally; rely on the prop value.
  }, [user]);

  useEffect(() => {
    // On mount or when user/jobSeekerId changes, load stored resume for this user
    if (user?.id || jobSeekerId) {
      const key = `resumeInfo_${user?.id || jobSeekerId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const info = JSON.parse(stored);
          if (info && info.filename) {
            setUploadedFile({ name: info.filename } as File);
          }
        } catch {
          // Ignore JSON parse errors
        }
      }
    }
  }, [user?.id, jobSeekerId]);

  // Handle file upload and analysis
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !jobSeekerId) return;
    setUploadedFile(file);
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const analysis = await resumeService.analyzeResume(file, jobSeekerId);
      setResumeAnalysis(analysis);
      setResumeAnalysisData(analysis); // <-- update shared context
      localStorage.setItem('resumeAnalysisData', JSON.stringify(analysis)); // persist full analysis for permanent recommendations
      // Store extracted skills and text in localStorage for cross-page access
      if (analysis && analysis.extractedSkills) {
        localStorage.setItem('resumeSkills', JSON.stringify(analysis.extractedSkills));
      }
      if (analysis && analysis.resumeText) {
        localStorage.setItem('resumeText', analysis.resumeText);
      }
      if (analysis && analysis.jobMatches) {
        // Store job matches with jobSeekerId for cross-tab consistency
        localStorage.setItem('resumeJobMatches', JSON.stringify({ jobSeekerId: analysis.jobSeekerId || jobSeekerId, matches: analysis.jobMatches }));
      }
      // Store resume info per user
      const key = `resumeInfo_${user?.id || jobSeekerId}`;
      localStorage.setItem(key, JSON.stringify({ filename: file.name, resumeId: analysis?.resumeId }));
    } catch (err: unknown) {
      setAnalysisError((err as Error).message || 'Failed to analyze resume');
    } finally {
      setAnalysisLoading(false);
    }
  };


  const handleCancelUpload = () => {
    setUploadedFile(null);
    setResumeAnalysis(null);
    setAnalysisError(null);
    // Also clear file input value
    const input = document.getElementById('resume-upload-input') as HTMLInputElement | null;
    if (input) input.value = '';
    // Remove stored resume info for this user
    const key = `resumeInfo_${user?.id || jobSeekerId}`;
    localStorage.removeItem(key);
  };

  // Handle resume text analysis (top matches)
  const handleAnalyzeText = async () => {
    if (!resumeText) return;
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const matches = await resumeService.getTopMatches(resumeText, 10);
      setTopMatches(matches);
    } catch (err: unknown) {
      setAnalysisError((err as Error).message || 'Failed to get top matches');
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
    } catch (err: unknown) {
      setAnalysisError((err as Error).message || 'Failed to extract skills');
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
            {uploadedFile ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">{uploadedFile.name}</span>
                <Button size="icon" variant="ghost" onClick={handleCancelUpload} aria-label="Cancel upload">
                  ×
                </Button>
              </div>
            ) : (
              <Button onClick={() => document.getElementById('resume-upload-input')?.click()}>
                Upload Resume
              </Button>
            )}
          </div>
          {analysisLoading && (
            <div className="my-4 text-blue-600">Analyzing resume, please wait...</div>
          )}
          {analysisError && (
            <div className="my-4 text-red-600">{analysisError}</div>
          )}
          {/* Analysis Results */}
          {(resumeAnalysis || resumeAnalysisData) && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Top Job Recommendations for You</h3>
              {resumeAnalysisData?.jobMatches && resumeAnalysisData.jobMatches.length > 0 ? (
                <div className="space-y-6">
                  {resumeAnalysisData.jobMatches
                    .sort((a: JobMatch, b: JobMatch) => b.matchPercentage - a.matchPercentage)
                    .slice(0, 3)
                    .map((match: JobMatch, idx: number) => (
                      <Card key={match.googleJobId || idx} className="border shadow-sm">
                        <CardHeader>
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div>
                              <CardTitle>{match.jobTitle} <span className="text-gray-500 font-normal">at {match.companyName}</span></CardTitle>
                              <CardDescription className="text-xs mt-1">{match.location}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-lg ${getMatchColor(match.matchPercentage)}`}>{match.matchPercentage}% match</span>
                              <a href={match.applyLink} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="outline">Apply</Button>
                              </a>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-2">
                            <span className="font-medium">Matched Skills: </span>
                            {match.matchedSkills && match.matchedSkills.length > 0 ? (
                              <span className="text-green-700">{match.matchedSkills.join(', ')}</span>
                            ) : <span className="text-gray-500">None</span>}
                          </div>
                          <div className="mb-2">
                            <span className="font-medium">Missing Skills: </span>
                            {match.missingSkills && match.missingSkills.length > 0 ? (
                              <span className="text-red-700">{match.missingSkills.join(', ')}</span>
                            ) : <span className="text-green-700">None! You’re a perfect match.</span>}
                          </div>
                          {/* Smart Suggestions Section */}
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <div className="font-semibold mb-1">How to Improve Your Match</div>
                            <ul className="list-disc ml-5 text-sm space-y-1">
                              {/* Suggest missing skills */}
                              {match.missingSkills && match.missingSkills.length > 0 && match.missingSkills.map((skill: string) => (
                                <li key={skill}>Add or highlight experience with <b>{skill}</b> in your resume.</li>
                              ))}
                              {/* Suggest missing qualifications */}
                              {match.qualifications && (resumeAnalysis?.resumeText || resumeAnalysisData?.resumeText) &&
                                match.qualifications.split(/[.,•\n]/).map((qual: string, i: number) => {
                                  const qualTrim = qual.trim();
                                  const resumeText = resumeAnalysis?.resumeText || resumeAnalysisData?.resumeText || '';
                                  if (qualTrim && !resumeText.toLowerCase().includes(qualTrim.toLowerCase().slice(0, 8))) {
                                    return <li key={i}>Consider including: <b>{qualTrim}</b></li>;
                                  }
                                  return null;
                                })}
                              {/* Suggest keywords from responsibilities */}
                              {match.responsibilities && Array.isArray(match.responsibilities) && match.responsibilities.map((resp: string, i: number) => {
                                const resumeText = resumeAnalysis?.resumeText || resumeAnalysisData?.resumeText || '';
                                if (resumeText && !resumeText.toLowerCase().includes(resp.toLowerCase().slice(0, 8))) {
                                  return <li key={i + 'resp'}>Mention experience with: <b>{resp}</b></li>;
                                }
                                return null;
                              })}
                              {/* If no suggestions */}
                              {(!match.missingSkills || match.missingSkills.length === 0) &&
                                (!match.qualifications || match.qualifications.split(/[.,•\n]/).every((qual: string) => {
                                  const resumeText = resumeAnalysis?.resumeText || resumeAnalysisData?.resumeText || '';
                                  return !qual.trim() || (resumeText && resumeText.toLowerCase().includes(qual.trim().toLowerCase().slice(0, 8)));
                                })) &&
                                (!match.responsibilities || match.responsibilities.every((resp: string) => {
                                  const resumeText = resumeAnalysis?.resumeText || resumeAnalysisData?.resumeText || '';
                                  return resumeText && resumeText.toLowerCase().includes(resp.toLowerCase().slice(0, 8));
                                })) && (
                                  <li>No major gaps detected. Your resume is a great fit!</li>
                                )}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div>No job matches found.</div>
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
