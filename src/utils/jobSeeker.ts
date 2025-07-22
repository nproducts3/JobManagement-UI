import { jobSeekerService } from '@/services/jobSeekerService';

// Utility to consistently retrieve the jobSeekerId from localStorage (or future global state)
export async function ensureJobSeekerIdInStorage(userId: string) {
  // Fetch jobseeker profile by userId
  const jobSeekerArr = await jobSeekerService.getByUserId(userId);
  if (jobSeekerArr && jobSeekerArr.length > 0) {
    const jobSeeker = jobSeekerArr[0];
    // Store in localStorage for future use
    localStorage.setItem('jobSeekerId', jobSeeker.id);
    // Optionally update resumeInfo too
    const resumeInfo = localStorage.getItem(`resumeInfo_${userId}`);
    if (resumeInfo) {
      const parsed = JSON.parse(resumeInfo);
      parsed.resumeId = jobSeeker.id;
      localStorage.setItem(`resumeInfo_${userId}`, JSON.stringify(parsed));
    }
  }
}

export function getJobSeekerId(): string | null {
  // Prefer explicit jobSeekerId if present
  const jobSeekerId = localStorage.getItem('jobSeekerId');
  if (jobSeekerId) return jobSeekerId;
  // Fallback: try to extract from resumeInfo
  const userId = localStorage.getItem('userId');
  if (userId) {
    const resumeInfo = localStorage.getItem(`resumeInfo_${userId}`);
    if (resumeInfo) {
      try {
        const parsed = JSON.parse(resumeInfo);
        if (parsed && parsed.resumeId) {
          return parsed.resumeId;
        }
      } catch {}
    }
  }
  return null;
}
