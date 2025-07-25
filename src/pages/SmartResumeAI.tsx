import React, { useState, useRef } from 'react';
import { SuggestionCard, Suggestion } from '@/components/JobSuggestions';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, FileText, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { getJobSeekerId } from '@/utils/jobSeeker';
import { resumeService } from '@/services/resumeService';

interface JobMatch {
  jobId: string;
  jobTitle: string;
  companyName: string;
  aiSuggestions: string;
  matchPercentage: number;
  // ...other fields
}

interface ResumeAnalysis {
  resumeText: string;
  jobMatches: JobMatch[];
}

const parseSuggestions = (aiSuggestions: string): Suggestion[] => {
  if (!aiSuggestions) return [];
  return aiSuggestions.split(/\n\n|\n/).filter(s => s.trim() !== '').map((desc, idx) => ({
    title: `Suggestion ${idx + 1}`,
    points: 10,
    description: desc,
    autofix: 'Auto-fix this suggestion',
    color: ['blue', 'green', 'orange', 'purple', 'indigo'][idx % 5],
  }));
};

const SmartResumeAI: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobSeekerId, setJobSeekerId] = useState('');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag-and-drop handlers
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !jobSeekerId) return;
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    try {
      // Use the resumeService to upload and analyze the resume
      const data = await resumeService.analyzeResume(file, jobSeekerId);
      setAnalysis(data);
      setResumeText(data.resumeText);
      setSelectedJobId(data.jobMatches[0]?.jobId || '');
      setCanDownload(false);
      // Store job matches with jobSeekerId in localStorage for cross-tab consistency
      const jobSeekerIdFromResp = data.jobSeekerId || jobSeekerId;
      if (jobSeekerIdFromResp && Array.isArray(data.jobMatches)) {
        localStorage.setItem('resumeJobMatches', JSON.stringify({ jobSeekerId: jobSeekerIdFromResp, matches: data.jobMatches }));
      }
      setUploadProgress(100);
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };


  const selectedJob = analysis?.jobMatches.find(j => j.jobId === selectedJobId);
  const suggestions = parseSuggestions(selectedJob?.aiSuggestions || '');

  const handleApplySuggestion = async (suggestion: Suggestion) => {
    if (!selectedJob || !jobSeekerId) return;
    setIsApplying(true);
    setError(null);
    try {
      const payload = {
        action: 'auto-improve',
        resumeText,
        googleJobId: selectedJob.jobId, // Use googleJobId if available
        jobSeekerId,
        suggestion: suggestion.description,
      };
      const res = await fetch('/api/resume-analysis/auto-improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to apply suggestion');
      const data = await res.json();
      setResumeText(data.resumeText);
      setCanDownload(!!data.canDownload);
      // Update analysis/jobMatches with new match % and suggestions
      setAnalysis(prev => prev && ({
        ...prev,
        resumeText: data.resumeText,
        jobMatches: prev.jobMatches.map(j =>
          j.jobId === selectedJob.jobId
            ? { ...j, matchPercentage: data.matchPercentage, aiSuggestions: (data.suggestions || '').join ? data.suggestions.join('\n') : data.suggestions }
            : j
        ),
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to apply suggestion.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([resumeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AI-Optimized-Resume.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Smart AI Resume Analysis</h1>
      {/* Upload Section */}
      <div
        className={`mb-6 p-6 rounded-lg border-2 border-dashed flex flex-col items-center gap-4 relative transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        tabIndex={0}
        aria-label="Resume upload area"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={handleFileChange}
        />
        <UploadCloud className="w-10 h-10 text-blue-400 mb-2" />
        <p className="text-gray-700 text-center">
          Drag & drop your resume here, or
          <Button
            variant="link"
            className="ml-1 px-0 py-0 text-blue-600"
            onClick={() => fileInputRef.current?.click()}
            tabIndex={-1}
          >
            browse
          </Button>
          <span> (PDF or DOCX)</span>
        </p>
        {file && (
          <div className="flex items-center gap-2 mt-2">
            <FileText className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-800">{file.name}</span>
            <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
            <Button size="icon" variant="ghost" onClick={() => setFile(null)} aria-label="Remove file">
              <XCircle className="w-5 h-5 text-red-400" />
            </Button>
          </div>
        )}
        {isUploading && (
          <div className="w-full mt-4">
            <Progress value={uploadProgress} />
            <div className="flex items-center gap-2 mt-1 text-blue-600 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading & analyzing resume... ({uploadProgress}%)
            </div>
          </div>
        )}
        {error && (
          <div className="mt-2 text-red-600 text-sm flex items-center gap-1"><XCircle className="w-4 h-4" /> {error}</div>
        )}
        <input
          type="text"
          placeholder="Enter Job Seeker ID"
          value={jobSeekerId}
          onChange={e => setJobSeekerId(e.target.value)}
          className="border rounded px-2 py-1 mt-2 w-64"
          aria-label="Job Seeker ID"
        />
        <Button
          onClick={handleUpload}
          disabled={isUploading || !file || !jobSeekerId}
          className="mt-2"
        >
          {isUploading ? 'Analyzing...' : 'Analyze Resume'}
        </Button>
      </div>
      {/* Resume Analysis Results */}
      {analysis && (
        <>
          <div className="mb-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="font-semibold mb-1">Resume Preview:</div>
              <textarea
                value={resumeText}
                readOnly
                rows={10}
                className="w-full border rounded p-2 text-sm bg-gray-50 resize-none"
                aria-label="Resume preview"
              />
            </div>
            <div className="w-full md:w-64">
              <div className="font-semibold mb-1">Analysis Stats</div>
              <div className="bg-gray-50 rounded p-3 text-sm">
                <div>Jobs Analyzed: <b>{analysis.jobMatches.length}</b></div>
                <div>Avg. Match %: <b className="text-blue-700">{(analysis.jobMatches.reduce((a, b) => a + (b.matchPercentage || 0), 0) / analysis.jobMatches.length).toFixed(1)}%</b></div>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <label className="block font-semibold mb-2">Job Matches</label>
            <div className="space-y-4">
              {analysis.jobMatches.map((job) => (
                <div
                  key={job.jobId}
                  className={`rounded-lg border shadow-sm p-4 transition-all bg-white ${selectedJobId === job.jobId ? 'ring-2 ring-blue-400' : ''}`}
                  tabIndex={0}
                  aria-label={`Job match: ${job.jobTitle} at ${job.companyName}`}
                  onClick={() => setSelectedJobId(job.jobId)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                    <div>
                      <div className="font-semibold text-lg">{job.jobTitle} <span className="text-gray-500 font-normal">at {job.companyName}</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={job.matchPercentage} className="w-32" />
                      <span className={`font-bold text-lg ${job.matchPercentage >= 80 ? 'text-green-600' : job.matchPercentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{job.matchPercentage}%</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs font-medium">Matched Skills:</span>
                    {(job as any).matchedSkills && (job as any).matchedSkills.length > 0 ? (
                      (job as any).matchedSkills.map((skill: string) => (
                        <span key={skill} className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">{skill}</span>
                      ))
                    ) : <span className="text-gray-400">None</span>}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs font-medium">Missing Skills:</span>
                    {(job as any).missingSkills && (job as any).missingSkills.length > 0 ? (
                      (job as any).missingSkills.map((skill: string) => (
                        <span key={skill} className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">{skill}</span>
                      ))
                    ) : <span className="text-green-700">None! You’re a perfect match.</span>}
                  </div>
                  {/* AI Suggestions */}
                  {selectedJobId === job.jobId && (
                    <div className="mt-3">
                      <div className="font-semibold mb-2">AI Suggestions</div>
                      {parseSuggestions(job.aiSuggestions || '').length === 0 && <div className="text-gray-500">No suggestions available.</div>}
                      {parseSuggestions(job.aiSuggestions || '').map((sugg, idx) => (
                        <SuggestionCard
                          key={idx}
                          suggestion={sugg}
                          isApplying={isApplying}
                          onAutoFix={() => handleApplySuggestion(sugg)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {canDownload && (
            <Button onClick={handleDownload} className="mt-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Download AI-Optimized Resume</Button>
          )}
        </>
      )}
    </div>
  );
};

export default SmartResumeAI;