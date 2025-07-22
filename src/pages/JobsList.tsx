import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, MapPin, Clock, Star, Bookmark, Filter as FilterIcon, Sparkles } from 'lucide-react';
import { GoogleJob, JobSeeker } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ResumeOptimizationDashboard from '@/components/ResumeOptimizationDashboard';
import { Progress } from '@/components/ui/progress';
import JobSuggestions from '@/components/JobSuggestions';
import { SuggestionCard, Suggestion } from '@/components/JobSuggestions';

import { getJobSeekerId } from '@/utils/jobSeeker';
// Update JobMatch interface
declare interface JobMatch {
  jobId: string;
  googleJobId?: string;
  matchPercentage: number;
  aiSuggestions?: string;
  appliedSuggestions?: string[];
  resumeId?: string;
}

const KNOWN_SKILLS = ['JavaScript', 'React', 'Python', 'AWS', 'Node.js', 'TypeScript'];
const KNOWN_EXPERIENCE = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'];
const KNOWN_REMOTE = ['Remote', 'Hybrid', 'On-site'];

function extractSkills(qualifications: string | undefined): string[] {
  if (!qualifications) return [];
  const lower = qualifications.toLowerCase();
  return KNOWN_SKILLS.filter(skill => lower.includes(skill.toLowerCase()));
}

function extractExperience(text: string | undefined): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  return KNOWN_EXPERIENCE.filter(level => {
    if (level === 'Entry Level') return lower.includes('entry') || lower.includes('junior') || lower.includes('0-2 years');
    if (level === 'Mid Level') return lower.includes('mid') || lower.includes('3-5 years');
    if (level === 'Senior Level') return lower.includes('senior') || lower.includes('lead') || lower.includes('5+ years');
    if (level === 'Executive') return lower.includes('manager') || lower.includes('director') || lower.includes('vp') || lower.includes('cto') || lower.includes('ceo');
    return false;
  });
}

function extractRemote(job: GoogleJob): string[] {
  const location = job.location?.toLowerCase() || '';
  const description = job.description?.toLowerCase() || '';
  const scheduleType = job.scheduleType?.toLowerCase() || '';
  const remote: string[] = [];
  if (location.includes('remote') || description.includes('remote') || scheduleType.includes('remote')) remote.push('Remote');
  if (location.includes('hybrid') || description.includes('hybrid') || scheduleType.includes('hybrid')) remote.push('Hybrid');
  if (
    !location.includes('remote') && !location.includes('hybrid') &&
    !description.includes('remote') && !description.includes('hybrid') &&
    !scheduleType.includes('remote') && !scheduleType.includes('hybrid')
  ) remote.push('On-site');
  return remote;
}

const JOBS_PER_PAGE = 10;

// Utility to calculate match percentage between two skill arrays
function calculateSkillMatch(userSkills: string[], jobSkills: string[]): number {
  if (!userSkills || !jobSkills || jobSkills.length === 0) return 0;
  const matched = jobSkills.filter(skill => userSkills.includes(skill));
  return Math.round((matched.length / jobSkills.length) * 100);
}

function applySuggestionToResume(resumeText: string, suggestion: string): string {
  // Example: If suggestion contains "Add or highlight experience with <Skill>"
  const skillMatch = suggestion.match(/Add or highlight experience with (.+?) in your resume/i);
  if (skillMatch) {
    const skill = skillMatch[1];
    // Try to find a Skills section
    if (resumeText.includes("Skills:")) {
      // Insert skill if not already present
      const skillsSection = resumeText.match(/Skills:(.*?)(\n\n|$)/s);
      if (skillsSection && !skillsSection[1].includes(skill)) {
        return resumeText.replace(
          /Skills:(.*?)(\n\n|$)/s,
          (match, skills, ending) => `Skills:${skills}, ${skill}${ending}`
        );
      }
    } else {
      // No Skills section, add one at the top
      return `Skills: ${skill}\n\n` + resumeText;
    }
  }
  // Fallback: append at the end if no pattern matched and not already present
  if (!resumeText.includes(suggestion)) {
    return resumeText + '\n' + suggestion;
  }
  return resumeText;
}

// Replace the old parseSuggestions with the advanced parser
const parseSuggestions = (aiSuggestions: unknown): Suggestion[] => {
  if (typeof aiSuggestions !== 'string' || !aiSuggestions.trim()) return [];
  // Split by markdown section headers like '**1. ...**' or numbered lists
  // This will match both numbered and bulleted markdown sections
  const sectionRegex = /\*\*\d+\.\s*([^*]+)\*\*([\s\S]*?)(?=(\*\*\d+\.|$))/g;
  const matches = [...aiSuggestions.matchAll(sectionRegex)];
  if (matches.length > 0) {
    return matches.map((m, idx) => ({
      title: m[1].trim(),
      points: 10,
      description: m[2].trim(),
      autofix: '',
      color: ['blue', 'green', 'orange', 'purple', 'indigo'][idx % 5],
    }));
  }
  // Fallback: split by double newlines or single newlines if no headers found
  return aiSuggestions
    .split(/\n\n|\n/)
    .filter(s => s.trim() !== '')
    .map((desc, idx) => ({
      title: `Suggestion ${idx + 1}`,
      points: 10,
      description: desc,
      autofix: 'Auto-fix this suggestion',
      color: ['blue', 'green', 'orange', 'purple', 'indigo'][idx % 5],
    }));
};

const JobsList = () => {
  const { isAuthenticated, role } = useAuth();
  const [jobs, setJobs] = useState<GoogleJob[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');
  const [salaryRange, setSalaryRange] = useState([0]);
  const navigate = useNavigate();

  // Filter states
  const [jobTypeFilters, setJobTypeFilters] = useState({
    fullTime: false,
    partTime: false,
    contract: false,
    internship: false
  });

  const [experienceFilters, setExperienceFilters] = useState({
    entryLevel: false,
    midLevel: false,
    seniorLevel: false,
    executive: false
  });

  const [remoteFilters, setRemoteFilters] = useState({
    remote: false,
    hybrid: false,
    onsite: false
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [showJobseekerDialog, setShowJobseekerDialog] = useState(false);
  const [jobseekers, setJobseekers] = useState<JobSeeker[]>([]);
  const [selectedJobseeker, setSelectedJobseeker] = useState<string>('');
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string | null>(null);
  const [showResumeOptimization, setShowResumeOptimization] = useState(false);
  const [dashboardSuggestions, setDashboardSuggestions] = useState([]);
  const [dashboardScore, setDashboardScore] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({ suggestionsFound: 0, completed: 0, remaining: 0, pointsGained: 0 });
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [jobSuggestions, setJobSuggestions] = useState<Record<string, { suggestions: string[]; match: number }>>({});
  const [resumeText, setResumeText] = useState<string>(localStorage.getItem('resumeText') || '');
  const [isApplying, setIsApplying] = useState<Record<string, boolean>>({});
  const [showSuggestionsModal, setShowSuggestionsModal] = useState<Record<string, boolean>>({});
  const [perJobSuggestions, setPerJobSuggestions] = useState<Record<string, Suggestion[]>>({});
  const [perJobMatch, setPerJobMatch] = useState<Record<string, number>>({});
  const [perJobResumeText, setPerJobResumeText] = useState<Record<string, string>>({});
  const [perJobIsApplying, setPerJobIsApplying] = useState<Record<string, boolean>>({});
  const [perJobCanDownload, setPerJobCanDownload] = useState<Record<string, boolean>>({});
  const [appliedSuggestions, setAppliedSuggestions] = useState<Record<string, string[]>>({});
  // Add resumeId state if missing
  const [resumeId, setResumeId] = useState<string | null>(null);
  // Add state for backend match percentages
  const [backendMatchPercentages, setBackendMatchPercentages] = useState<Record<string, number>>({});

  // Get jobSeekerId robustly via utility (matches ResumeTab)
  const jobSeekerId = getJobSeekerId();

  // Function to fetch match percentage for a single job
  const fetchJobMatchPercentage = async (jobId: string, googleJobId: string) => {
    if (!jobSeekerId) return;
    try {
      const response = await fetch(
        `http://localhost:8080/api/resume-analysis/job/${googleJobId}/match-percentages?jobSeekerId=${jobSeekerId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log('Match API response for', googleJobId, data); // Debug
        // If the response is an array, find the right object
        if (Array.isArray(data) && data.length > 0) {
          // If jobSeekerId is present in the object, filter by it, else just use the first
          const matchObj = data.find(
            (obj) => obj.jobSeekerId === jobSeekerId
          ) || data[0];
          if (typeof matchObj.matchPercentage === 'number') {
            setBackendMatchPercentages(prev => ({
              ...prev,
              [googleJobId]: Math.round(matchObj.matchPercentage)
            }));
          }
        }
      }
    } catch (error) {
      console.error(`Failed to fetch match percentage for job ${googleJobId}:`, error);
    }
  };

  // On mount, always check if resumeJobMatches is for the current jobSeekerId
  useEffect(() => {
    async function fetchResumeJobMatches() {
      if (!jobSeekerId) return;
      const jobMatchesStored = localStorage.getItem('resumeJobMatches');
      let jobMatches = [];
      if (jobMatchesStored) {
        try {
          const parsed = JSON.parse(jobMatchesStored);
          if (parsed.jobSeekerId === jobSeekerId && Array.isArray(parsed.matches)) {
            jobMatches = parsed.matches.filter(m => m.jobSeekerId === jobSeekerId);
          
          } else {
            // Remove stale/other-user matches
            localStorage.removeItem('resumeJobMatches');
          }
        } catch {
          localStorage.removeItem('resumeJobMatches');
        }
      }
      if (jobMatches.length === 0) {
        // Try to get resume file name from resumeInfo
        const resumeInfo = localStorage.getItem(`resumeInfo_${jobSeekerId}`);
        let resumeFileName = null;
        if (resumeInfo) {
          try {
            const parsed = JSON.parse(resumeInfo);
            resumeFileName = parsed.filename;
          } catch { /* ignore error */ }
        }
        // If resume file name is available, fetch the file from server or prompt user to upload again
        if (resumeFileName) {
          // NOTE: In a real app, you would fetch the file from the server or ask the user to re-upload
          // Here, we skip auto-fetching the file for security reasons
        }
      }
    }
    fetchResumeJobMatches();
  }, [jobSeekerId]);

  // On mount, load job suggestions from localStorage (from resume analysis)
  useEffect(() => {
    const jobMatchesStored = localStorage.getItem('resumeJobMatches');
    if (jobMatchesStored) {
      try {
        const jobMatches = JSON.parse(jobMatchesStored);
        const newJobSuggestions: Record<string, { suggestions: string[]; match: number }> = {};
        jobMatches.forEach((jm: JobMatch) => {
          newJobSuggestions[jm.jobId] = {
            suggestions: jm.aiSuggestions ? jm.aiSuggestions.split(/\n\n|\n/).filter((s: string) => s.trim() !== '') : [],
            match: jm.matchPercentage || 0,
          };
        });
        setJobSuggestions(newJobSuggestions);
      } catch { /* ignore error */ }
    }
  }, []);

  // On mount, initialize per-job suggestions, match, and appliedSuggestions from localStorage
  useEffect(() => {
    const jobMatchesStored = localStorage.getItem('resumeJobMatches');
    const resumeTextStored = localStorage.getItem('resumeText') || '';
    const resumeIdStored = localStorage.getItem('resumeId') || '';
    if (jobMatchesStored) {
      try {
        const jobMatches = JSON.parse(jobMatchesStored);
        const suggestions: Record<string, Suggestion[]> = {};
        const match: Record<string, number> = {};
        const resumeText: Record<string, string> = {};
        const canDownload: Record<string, boolean> = {};
        const applied: Record<string, string[]> = {};
        jobMatches.forEach((jm: JobMatch) => {
          suggestions[jm.jobId] = parseSuggestions(jm.aiSuggestions || '');
          match[jm.jobId] = jm.matchPercentage || 0;
          resumeText[jm.jobId] = resumeTextStored;
          canDownload[jm.jobId] = false;
          applied[jm.jobId] = jm.appliedSuggestions || [];
        });
        setPerJobSuggestions(suggestions);
        setPerJobMatch(match);
        setPerJobResumeText(resumeText);
        setPerJobCanDownload(canDownload);
        setAppliedSuggestions(applied);
        if (resumeIdStored) {
          setResumeId(resumeIdStored);
        }
      } catch { /* ignore error */ }
    }
  }, []);

  // Read user's extracted skills from localStorage
  let userSkills: string[] = [];
  try {
    const stored = localStorage.getItem('resumeSkills');
    if (stored) userSkills = JSON.parse(stored);
  } catch { /* ignore error */ }

  // Read backend jobMatches from localStorage
  let jobMatches: JobMatch[] = [];
  try {
    const storedMatches = localStorage.getItem('resumeJobMatches');
    if (storedMatches) jobMatches = JSON.parse(storedMatches);
  } catch { /* ignore error */ }

  // Helper to get backend match percentage for a job
  function getBackendMatchPercentage(jobId: string): number | null {
    const match = jobMatches.find((m) => m.jobId === jobId);
    return match ? Math.round(match.matchPercentage) : null;
  }

  useEffect(() => {
    fetchJobs();
  }, [currentPage]);

  useEffect(() => {
    setSearchParams({ ...Object.fromEntries(searchParams.entries()), page: currentPage.toString() });
  }, [currentPage]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        // Reset to page 1 when searching
        setSearchParams({ ...Object.fromEntries(searchParams.entries()), page: '1' });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, setSearchParams]);

  // Update fetchJobs to fetch match percentages for each job using googleJobId
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/google-jobs?page=${currentPage - 1}&size=${JOBS_PER_PAGE}`);
      if (response.ok) {
        const data = await response.json();
        // Use backend response: { content, totalElements }
        const jobsWithExtracted = data.content.map((job: GoogleJob) => ({
          ...job,
          extractedSkills: extractSkills(job.qualifications),
          extractedExperience: extractExperience((job.qualifications || '') + ' ' + (job.description || '')),
          extractedRemote: extractRemote(job)
        }));
        setJobs(jobsWithExtracted);
        setTotalJobs(data.totalElements);
        // Fetch match percentages for each job using googleJobId
        jobsWithExtracted.forEach(job => {
          const googleJobId = getGoogleJobId(job);
          fetchJobMatchPercentage(job.id, googleJobId);
        });
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJobseekers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users/jobseekers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setJobseekers(data);
      }
    } catch (error) {
      console.error('Failed to fetch jobseekers:', error);
    }
  };

  const handleApplyNow = (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (role?.roleName === 'ROLE_EMPLOYER') {
      setPendingJobId(jobId);
      setShowJobseekerDialog(true);
      if (jobseekers.length === 0) fetchJobseekers();
      return;
    }
    navigate(`/google-jobs/${jobId}`);
  };

  const handleJobseekerApply = () => {
    if (selectedJobseeker && pendingJobId) {
      setShowJobseekerDialog(false);
      setTimeout(() => {
        navigate(`/google-jobs/${pendingJobId}`);
      }, 100); // Small delay for dialog close
    }
  };

  // Helper to get the best available match percentage (backend first, then localStorage fallback)
  const getMatchPercentage = (jobId: string, googleJobId?: string): number => {
    // First try backend match percentage using googleJobId
    if (googleJobId && backendMatchPercentages[googleJobId] !== undefined) {
      return backendMatchPercentages[googleJobId];
    }
    // Fallback to localStorage match percentage
    return perJobMatch[jobId] || 0;
  };

  const resetFilters = () => {
    setJobTypeFilters({ fullTime: false, partTime: false, contract: false, internship: false });
    setExperienceFilters({ entryLevel: false, midLevel: false, seniorLevel: false, executive: false });
    setRemoteFilters({ remote: false, hybrid: false, onsite: false });
    setSelectedSkills([]);
    setSalaryRange([0]);
    setSearchTerm('');
    setSearchParams({ page: '1' });
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchTerm || 
           Object.values(jobTypeFilters).some(Boolean) ||
           Object.values(experienceFilters).some(Boolean) ||
           Object.values(remoteFilters).some(Boolean) ||
           selectedSkills.length > 0 ||
           salaryRange[0] > 0;
  };

  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);

  const handlePageChange = (pageNum: number) => {
    setSearchParams({ ...Object.fromEntries(searchParams.entries()), page: pageNum.toString() });
  };

  // Filter jobs based on all filter criteria
  const filteredJobs = jobs.filter(job => {
    const companyName = job.companyName || '';
    const jobTitle = job.title || '';
    const location = job.location || '';
    const description = job.description || '';
    const qualifications = job.qualifications || '';
    const scheduleType = job.scheduleType || '';
    
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const searchText = `${jobTitle} ${companyName} ${location}`.toLowerCase();
      if (!searchText.includes(searchLower)) {
        return false;
      }
    }

    // Job type filter
    const hasJobTypeFilter = Object.values(jobTypeFilters).some(Boolean);
    if (hasJobTypeFilter) {
      const jobTypeMatches = Object.entries(jobTypeFilters).some(([key, checked]) => {
        if (!checked) return false;
        const scheduleLower = scheduleType.toLowerCase();
        switch (key) {
          case 'fullTime': return scheduleLower.includes('full-time') || scheduleLower.includes('full time');
          case 'partTime': return scheduleLower.includes('part-time') || scheduleLower.includes('part time');
          case 'contract': return scheduleLower.includes('contract');
          case 'internship': return scheduleLower.includes('internship');
          default: return false;
        }
      });
      if (!jobTypeMatches) return false;
    }

    // Experience level filter
    const hasExperienceFilter = Object.values(experienceFilters).some(Boolean);
    if (hasExperienceFilter) {
      const experienceMatches = Object.entries(experienceFilters).some(([key, checked]) => {
        if (!checked) return false;
        const text = `${qualifications} ${description}`.toLowerCase();
        switch (key) {
          case 'entryLevel': return text.includes('entry') || text.includes('junior') || text.includes('0-2 years') || text.includes('0-1 years');
          case 'midLevel': return text.includes('mid') || text.includes('3-5 years') || text.includes('2-5 years');
          case 'seniorLevel': return text.includes('senior') || text.includes('lead') || text.includes('5+ years') || text.includes('5-10 years');
          case 'executive': return text.includes('manager') || text.includes('director') || text.includes('vp') || text.includes('cto') || text.includes('ceo');
          default: return false;
        }
      });
      if (!experienceMatches) return false;
    }

    // Remote filter
    const hasRemoteFilter = Object.values(remoteFilters).some(Boolean);
    if (hasRemoteFilter) {
      const remoteMatches = Object.entries(remoteFilters).some(([key, checked]) => {
        if (!checked) return false;
        const locationLower = location.toLowerCase();
        const descLower = description.toLowerCase();
        const scheduleLower = scheduleType.toLowerCase();
        switch (key) {
          case 'remote': return locationLower.includes('remote') || descLower.includes('remote') || scheduleLower.includes('remote');
          case 'hybrid': return locationLower.includes('hybrid') || descLower.includes('hybrid') || scheduleLower.includes('hybrid');
          case 'onsite': return !locationLower.includes('remote') && !locationLower.includes('hybrid') && 
                              !descLower.includes('remote') && !descLower.includes('hybrid') &&
                              !scheduleLower.includes('remote') && !scheduleLower.includes('hybrid');
          default: return false;
        }
      });
      if (!remoteMatches) return false;
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      const jobSkills = job.extractedSkills || [];
      const hasRequiredSkill = selectedSkills.some(skill => 
        jobSkills.some(jobSkill => jobSkill.toLowerCase().includes(skill.toLowerCase()))
      );
      if (!hasRequiredSkill) return false;
    }

    // Salary filter (basic implementation)
    if (salaryRange[0] > 0) {
      // This is a simplified salary filter - in a real app you'd parse salary ranges
      // For now, we'll just check if salary exists
      if (!job.salary) return false;
    }

    return true;
  });

  // Sort filtered jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    let dateA, dateB;
    switch (sortBy) {
      case 'date':
        dateA = new Date(a.createdDateTime || a.postedAt || 0);
        dateB = new Date(b.createdDateTime || b.postedAt || 0);
        return dateB.getTime() - dateA.getTime();
      case 'salary':
        // Simplified salary sorting - in real app you'd parse salary ranges
        return (b.salary || '').localeCompare(a.salary || '');
      case 'relevance':
      default:
        // Default relevance sorting (could be based on match percentage)
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading jobs...</div>
      </div>
    );
  }

  // Helper to fetch resume analysis and extract dashboard suggestions
  const fetchResumeAnalysisForDashboard = async () => {
    if (!jobSeekerId) return;
    const resumeInfo = localStorage.getItem(`resumeInfo_${jobSeekerId}`);
    let resumeFileName = null;
    if (resumeInfo) {
      try {
        const parsed = JSON.parse(resumeInfo);
        resumeFileName = parsed.filename;
      } catch { /* ignore error */ }
    }
    if (!resumeFileName) return;
    // Try to get the file from the file input (if available in DOM)
    // Otherwise, skip file upload (cannot fetch file from disk for security reasons)
    // If you want to support re-upload, prompt user to upload again
    // For demo, just use existing jobMatches from localStorage if present
    const jobMatchesStored = localStorage.getItem('resumeJobMatches');
    let jobMatches = [];
    const averageMatchPercentage = 0;
    if (jobMatchesStored) {
      try {
        jobMatches = JSON.parse(jobMatchesStored);
      } catch { /* ignore error */ }
    }
    // If you want to fetch from backend, you need the File object (not just filename)
    // For now, use localStorage data
    // Extract AI suggestions
    const suggestions = (jobMatches || [])
      .filter(jm => jm.aiSuggestions && jm.aiSuggestions.trim() !== "")
      .map(jm => ({
        title: jm.jobTitle + " at " + jm.companyName,
        points: 10,
        description: jm.aiSuggestions,
        autofix: "See AI suggestions above",
        color: "blue",
      }));
    // Calculate stats
    const score = jobMatches.length > 0 ? Math.round(jobMatches.reduce((acc, jm) => acc + (jm.matchPercentage || 0), 0) / jobMatches.length) : 0;
    setDashboardSuggestions(suggestions);
    setDashboardScore(score);
    setDashboardStats({
      suggestionsFound: suggestions.length,
      completed: 0,
      remaining: suggestions.length,
      pointsGained: 0,
    });
  };

  // Handler for Gemini icon click
  const handleGeminiClick = () => {
    fetchResumeAnalysisForDashboard();
    setShowResumeOptimization(true);
  };

  // Apply a suggestion for a specific job
  const handleApplySuggestion = async (jobId: string, suggestion: string) => {
    setIsApplying(prev => ({ ...prev, [jobId]: true }));
    // 1. Use smarter logic
    const updatedResumeText = applySuggestionToResume(resumeText, suggestion);
    setResumeText(updatedResumeText);
    localStorage.setItem('resumeText', updatedResumeText);
    // 2. Re-analyze resume
    const jobSeekerId = getJobSeekerId();
    if (!jobSeekerId) {
      setIsApplying(prev => ({ ...prev, [jobId]: false }));
      return;
    }
    // Send updated resume text to backend (simulate as text, or use file if needed)
    const formData = new FormData();
    formData.append('resumeText', updatedResumeText);
    // If your backend requires a file, you need to create a Blob/File from the text
    // For now, assume it accepts resumeText
    try {
      const res = await fetch(`http://localhost:8080/api/resume-analysis/analyze?jobSeekerId=${jobSeekerId}`, {
        method: 'POST',
        body: formData,
      });
      const analysis = await res.json();
      // Find the job match for this job
      const match = analysis.jobMatches.find((jm: JobMatch) => jm.jobId === jobId);
      setJobSuggestions(prev => ({
        ...prev,
        [jobId]: {
          suggestions: match && match.aiSuggestions ? match.aiSuggestions.split(/\n\n|\n/).filter((s: string) => s.trim() !== '') : [],
          match: match ? match.matchPercentage : prev[jobId]?.match || 0,
        },
      }));
    } catch { /* ignore error */ }
    setIsApplying(prev => ({ ...prev, [jobId]: false }));
  };

  // Handler to show/hide suggestions modal
  const handleShowSuggestions = (jobId: string, show: boolean) => {
    setShowSuggestionsModal(prev => ({ ...prev, [jobId]: show }));
  };

  // Helper to safely get googleJobId from a job object
  function getGoogleJobId(job: unknown): string {
    if (typeof job === 'object' && job !== null && 'jobId' in job && typeof (job as { jobId?: string }).jobId === 'string') {
      return (job as { jobId: string }).jobId;
    }
    return '';
  }

  // Handler for Auto-Fix
  const handleAutoFix = async (jobId: string, suggestion: Suggestion) => {
    setPerJobIsApplying(prev => ({ ...prev, [jobId]: true }));
    const jobSeekerId = getJobSeekerId();
    if (!jobSeekerId) {
      setPerJobIsApplying(prev => ({ ...prev, [jobId]: false }));
      return;
    }
    const resumeText = perJobResumeText[jobId] || '';
    // Find the job in jobs array to get googleJobId
    const jobObj = jobs.find(j => j.id === jobId);
    const googleJobId = getGoogleJobId(jobObj);
    const payload = {
      action: 'apply_suggestion',
      resumeText,
      googleJobId,
      jobSeekerId,
      suggestion: suggestion.description,
      resumeId: resumeId || undefined,
    };
    try {
      const res = await fetch('http://localhost:8080/api/resume-analysis/auto-improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setPerJobResumeText(prev => ({ ...prev, [jobId]: data.resumeText }));
      setPerJobMatch(prev => ({ ...prev, [jobId]: data.matchPercentage }));
      setPerJobSuggestions(prev => ({ ...prev, [jobId]: parseSuggestions(data.suggestions) }));
      setPerJobCanDownload(prev => ({ ...prev, [jobId]: !!data.canDownload && data.matchPercentage === 100 }));
      setAppliedSuggestions(prev => ({ ...prev, [jobId]: data.appliedSuggestions || [] }));
      const jobMatchesStored = localStorage.getItem('resumeJobMatches');
      if (jobMatchesStored) {
        let jobMatches: JobMatch[] = JSON.parse(jobMatchesStored);
        jobMatches = jobMatches.map((jm: JobMatch) =>
          jm.jobId === jobId || jm.googleJobId === googleJobId
            ? { ...jm, matchPercentage: data.matchPercentage, aiSuggestions: data.suggestions, appliedSuggestions: data.appliedSuggestions }
            : jm
        );
        localStorage.setItem('resumeJobMatches', JSON.stringify(jobMatches));
      }
      if (data.resumeId) {
        setResumeId(data.resumeId);
        localStorage.setItem('resumeId', data.resumeId);
      }
    } catch { /* ignore error */ }
    setPerJobIsApplying(prev => ({ ...prev, [jobId]: false }));
  };

  // Download handler
  const handleDownload = (jobId: string) => {
    const text = perJobResumeText[jobId] || '';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AI-Optimized-Resume.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Resume Optimization Dashboard Modal */}
      <ResumeOptimizationDashboard
        open={showResumeOptimization}
        onClose={() => setShowResumeOptimization(false)}
        score={dashboardScore}
        scoreLabel={dashboardScore < 60 ? "Needs Improvement" : dashboardScore < 80 ? "Good" : "Excellent"}
        suggestionsFound={dashboardStats.suggestionsFound}
        completed={dashboardStats.completed}
        remaining={dashboardStats.remaining}
        pointsGained={dashboardStats.pointsGained}
        suggestions={dashboardSuggestions}
      />
      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <div className="w-80 flex-shrink-0">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FilterIcon className="h-5 w-5" />
                  Filters
                  {hasActiveFilters() && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Active
                    </Badge>
                  )}
                </CardTitle>
                {hasActiveFilters() && (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Reset
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Job Type */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Job Type
                </h3>
                <div className="space-y-2">
                  {Object.entries(jobTypeFilters).map(([key, checked]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={checked}
                        onCheckedChange={(checked) =>
                          setJobTypeFilters(prev => ({ ...prev, [key]: !!checked }))
                        }
                      />
                      <label htmlFor={key} className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Experience Level
                </h3>
                <div className="space-y-2">
                  {Object.entries(experienceFilters).map(([key, checked]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={checked}
                        onCheckedChange={(checked) =>
                          setExperienceFilters(prev => ({ ...prev, [key]: !!checked }))
                        }
                      />
                      <label htmlFor={key} className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remote Options */}
              <div>
                <h3 className="font-medium mb-3">Remote Options</h3>
                <div className="space-y-2">
                  {Object.entries(remoteFilters).map(([key, checked]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={checked}
                        onCheckedChange={(checked) =>
                          setRemoteFilters(prev => ({ ...prev, [key]: !!checked }))
                        }
                      />
                      <label htmlFor={key} className="text-sm capitalize">
                        {key === 'onsite' ? 'On-site' : key}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <h3 className="font-medium mb-3">Salary Range</h3>
                <div className="px-2">
                  <Slider
                    value={salaryRange}
                    onValueChange={setSalaryRange}
                    max={200000}
                    step={10000}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                    <span>$0</span>
                    <span>${salaryRange[0].toLocaleString()}</span>
                    <span>$200k+</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="font-medium mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {['JavaScript', 'React', 'Python', 'AWS', 'Node.js', 'TypeScript'].map((skill) => (
                    <Badge
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedSkills(prev =>
                          prev.includes(skill)
                            ? prev.filter(s => s !== skill)
                            : [...prev, skill]
                        );
                      }}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
              {hasActiveFilters() ? `${sortedJobs.length} of ${totalJobs}` : totalJobs} Jobs Found
            </h1>
            <p className="text-gray-600">
              {hasActiveFilters() ? 'Filtered results' : 'All available jobs'}
            </p>
          </div>

          {/* Search and Sort */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search job title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {sortedJobs.map((job) => {
              const googleJobId = getGoogleJobId(job);
              const jobMatch = jobMatches.find((m) => m.jobId === job.id || (m.googleJobId && m.googleJobId === googleJobId));
              const aiSuggestions = jobMatch?.aiSuggestions;
              const companyName = job.companyName || 'Unknown Company';
              const jobTitle = job.title || 'Unknown Position';
              
              // Debug logging
              console.log('Job:', job.id, 'JobMatch:', jobMatch, 'aiSuggestions:', aiSuggestions);
              
              // If we have aiSuggestions but no parsed suggestions, populate perJobSuggestions
              if (aiSuggestions && (!perJobSuggestions[job.id] || perJobSuggestions[job.id].length === 0)) {
                const parsedSuggestions = parseSuggestions(aiSuggestions);
                if (parsedSuggestions.length > 0) {
                  setPerJobSuggestions(prev => ({ ...prev, [job.id]: parsedSuggestions }));
                }
              }
              
              return (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg font-semibold text-gray-600">
                              {companyName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Link 
                                to={`/google-jobs/${job.id}`}
                                className="text-xl font-semibold hover:text-blue-600 transition-colors"
                              >
                                {jobTitle}
                              </Link>
                              <Bookmark className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                            </div>
                            
                            <p className="text-gray-600 mb-2">{companyName}</p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              {job.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {job.location}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {job.scheduleType || 'Full-time'}
                              </span>
                              {job.salary && (
                                <span className="font-medium">{job.salary}</span>
                              )}
                            </div>

                            {/* Skills/Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.extractedRemote && job.extractedRemote.map((remote: string, i: number) => (
                                <Badge key={`remote-${i}`} variant="secondary">{remote}</Badge>
                              ))}
                              {job.extractedExperience && job.extractedExperience.map((exp: string, i: number) => (
                                <Badge key={`exp-${i}`} variant="outline">{exp}</Badge>
                              ))}
                              {job.extractedSkills && job.extractedSkills.length > 0 && job.extractedSkills.map((skill: string, index: number) => (
                                <Badge key={`skill-${index}`} variant="outline">{skill}</Badge>
                              ))}
                            </div>

                            {job.description && (
                              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                {job.description.substring(0, 150)}...
                              </p>
                            )}

                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>Posted {job.postedAt || '1 months ago'}</span>
                              <span>•</span>
                              <span>Via {job.via || 'LinkedIn'}</span>
                            </div>
                            {/* View Suggestions Button */}
                            <Button
                              size="sm"
                              className="mt-2"
                              onClick={() => handleShowSuggestions(job.id, true)}
                            >
                              View Suggestions
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 ml-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(getMatchPercentage(job.id, googleJobId) / 20)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{getMatchPercentage(job.id, googleJobId)}% Match</span>
                        </div>
                        
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={(e) => handleApplyNow(job.id, e)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  {/* Suggestions Modal */}
                  {showSuggestionsModal[job.id] && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
                        <button
                          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                          onClick={() => handleShowSuggestions(job.id, false)}
                          aria-label="Close"
                        >
                          ×
                        </button>
                        
                        {/* Header Section */}
                        <div className="mb-8">
                          <h2 className="text-2xl font-bold mb-2">AI Suggestions for {jobTitle} at {companyName}</h2>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-5 w-5 ${
                                    i < Math.floor(getMatchPercentage(job.id, googleJobId) / 20)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-lg font-medium">{getMatchPercentage(job.id, googleJobId)}% Match</span>
                          </div>
                        </div>

                        {/* Suggestions Section */}
                        <div className="space-y-6">
                          <h3 className="text-xl font-semibold mb-4">Improvements Available</h3>
                          
                          {perJobSuggestions[job.id]?.length === 0 ? (
                            aiSuggestions ? (
                              <div className="prose text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto bg-gray-50 p-6 rounded-lg">
                                <h4 className="text-lg font-semibold mb-3">Raw AI Suggestions:</h4>
                                {aiSuggestions}
                              </div>
                            ) : (
                              <div className="text-gray-500 text-center py-8">No suggestions available.</div>
                            )
                          ) : (
                            <div className="space-y-4">
                              {perJobSuggestions[job.id]?.map((sugg, idx) => (
                                <div key={idx} className={`border rounded-lg p-6 border-l-4 border-${sugg.color}-400 bg-${sugg.color}-50`}>
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold text-lg">{sugg.title}</span>
                                        <span className="bg-white border rounded-full px-3 py-1 text-sm font-medium text-gray-600">
                                          +{sugg.points} points
                                        </span>
                                      </div>
                                      <div className="text-gray-700 mb-3">{sugg.description}</div>
                                      <div className="text-sm text-gray-500">
                                        <span className="font-semibold">Auto-fix:</span> {sugg.autofix}
                                      </div>
                                    </div>
                                    <Button
                                      className="ml-4"
                                      disabled={perJobIsApplying[job.id]}
                                      onClick={() => handleAutoFix(job.id, sugg)}
                                    >
                                      {perJobIsApplying[job.id] ? "Applying..." : "Auto-fix"}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Footer Section */}
                        <div className="mt-8 pt-6 border-t">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {perJobMatch[job.id] === 100 && perJobCanDownload[job.id] && (
                                <Button onClick={() => handleDownload(job.id)}>Download AI-Optimized Resume</Button>
                              )}
                              {appliedSuggestions[job.id] && appliedSuggestions[job.id]?.length > 0 && (
                                <div className="text-sm text-green-700">
                                  Applied: {appliedSuggestions[job.id]?.join(', ')}
                                </div>
                              )}
                            </div>
                            <Button variant="outline" onClick={() => handleShowSuggestions(job.id, false)}>
                              Close
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {(() => {
                // Calculate the two page numbers to show
                let start = Math.max(1, currentPage - 1);
                const end = Math.min(totalPages, start + 1);
                // If we're at the last page, show the last two
                if (end === totalPages && totalPages > 1) start = totalPages - 1;
                // If only one page, start at 1
                if (totalPages === 1) start = 1;
                return Array.from({ length: Math.min(2, totalPages) }, (_, i) => start + i).map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`px-3 py-1 rounded border ${currentPage === pageNum ? 'bg-blue-600 text-white' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                ));
              })()}
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}

          {sortedJobs.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No jobs found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Jobseeker Selection Dialog for Employees */}
      <Dialog open={showJobseekerDialog} onOpenChange={setShowJobseekerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a Jobseeker to Apply As</DialogTitle>
          </DialogHeader>
          <Select value={selectedJobseeker} onValueChange={setSelectedJobseeker}>
            <SelectTrigger>
              <SelectValue placeholder="Select jobseeker" />
            </SelectTrigger>
            <SelectContent>
              {jobseekers.map(js => (
                <SelectItem key={js.id} value={js.id}>
                  {js.firstName} {js.lastName} ({js.user?.email ?? ''})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={handleJobseekerApply} disabled={!selectedJobseeker}>
              Continue to Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gemini AI Suggestions Modal */}
      {selectedSuggestions && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
            <h2 className="text-lg font-bold mb-2">Gemini AI Suggestions</h2>
            <div className="prose max-h-96 overflow-y-auto" dangerouslySetInnerHTML={{ __html: selectedSuggestions.replace(/\n/g, '<br/>') }} />
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setSelectedSuggestions(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsList;
