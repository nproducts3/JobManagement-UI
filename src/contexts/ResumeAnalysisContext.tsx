import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface JobMatch {
  jobId: string;
  googleJobId: string;
  jobTitle: string;
  companyName: string;
  location: string;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  categoryScores: any;
  jobDescription: string;
  qualifications: string;
  responsibilities: string[];
  benefits: string[];
  applyLink: string;
  salary: string;
  scheduleType: string;
  aiSuggestions: string;
  jobSeekerId: string | null;
  jobSeekerName: string | null;
}

export interface ResumeAnalysisData {
  resumeId: string;
  resumeFile: string;
  resumeText: string;
  uploadedAt: string;
  jobSeekerId: string;
  jobSeekerName: string;
  extractedSkills: string[];
  skillsByCategory: {
    databases: string[];
    other: string[];
    backend: string[];
    programming_languages: string[];
    frontend: string[];
  };
  jobMatches: JobMatch[];
  averageMatchPercentage: number;
  totalJobsAnalyzed: number;
  highMatchJobs: number;
  mediumMatchJobs: number;
  lowMatchJobs: number;
}

interface ResumeAnalysisContextValue {
  resumeAnalysisData: ResumeAnalysisData | null;
  setResumeAnalysisData: (data: ResumeAnalysisData | null) => void;
}

const ResumeAnalysisContext = createContext<ResumeAnalysisContextValue | undefined>(undefined);

export const ResumeAnalysisProvider = ({ children }: { children: ReactNode }) => {
  const [resumeAnalysisData, setResumeAnalysisData] = useState<ResumeAnalysisData | null>(null);

  // Restore from localStorage on mount (for all consumers)
  React.useEffect(() => {
    if (!resumeAnalysisData?.jobMatches?.length) {
      const stored = localStorage.getItem('resumeAnalysisData');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Normalize jobMatches
          if (parsed.jobMatches && Array.isArray(parsed.jobMatches)) {
            parsed.jobMatches = parsed.jobMatches.map((jm: any) => ({
              ...jm,
              matchedSkills: Array.isArray(jm.matchedSkills) ? jm.matchedSkills : [],
              missingSkills: Array.isArray(jm.missingSkills) ? jm.missingSkills : [],
            }));
          }
          setResumeAnalysisData(parsed);
        } catch {}
      }
    }
  }, []);

  return (
    <ResumeAnalysisContext.Provider value={{ resumeAnalysisData, setResumeAnalysisData }}>
      {children}
    </ResumeAnalysisContext.Provider>
  );
};

export function useResumeAnalysis() {
  const context = useContext(ResumeAnalysisContext);
  if (!context) {
    throw new Error('useResumeAnalysis must be used within a ResumeAnalysisProvider');
  }
  return context;
}
