
const BASE_URL = 'http://localhost:8080/api';

export interface ResumeData {
  id?: string;
  googleJobId: string;
  resumeFile: string;
  resumeText?: string;
  matchPercentage?: number;
  uploaded_at?: string;
}

export const resumeService = {
  // Analyze resume against all jobs
  analyzeResume: async (file: File, jobSeekerId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobSeekerId', jobSeekerId);
    const response = await fetch(`${BASE_URL}/resume-analysis/analyze`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to analyze resume');
    return response.json();
  },

  // Get top matching jobs for resume text
  getTopMatches: async (resumeText: string, limit = 10) => {
    const params = new URLSearchParams();
    params.append('resumeText', resumeText);
    params.append('limit', limit.toString());
    const response = await fetch(`${BASE_URL}/resume-analysis/top-matches`, {
      method: 'POST',
      body: params,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    if (!response.ok) throw new Error('Failed to get top matches');
    return response.json();
  },

  // Extract skills from resume text
  extractSkills: async (resumeText: string) => {
    const response = await fetch(`${BASE_URL}/resume-analysis/skills?resumeText=${encodeURIComponent(resumeText)}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to extract skills');
    return response.json();
  }
};
