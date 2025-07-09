
const BASE_URL = 'http://localhost:8080/api';

export interface ExperienceData {
  id?: string;
  jobSeekerId: string;
  jobTitle?: string;
  companyName?: string;
  startDate?: string;
  endDate?: string;
  responsibilities?: string[];
}

export const experienceService = {
  getAll: async (): Promise<ExperienceData[]> => {
    const response = await fetch(`${BASE_URL}/job-seeker-experience`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch experiences');
    return response.json();
  },

  getById: async (id: string): Promise<ExperienceData> => {
    const response = await fetch(`${BASE_URL}/job-seeker-experience/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch experience');
    return response.json();
  },

  getByJobSeekerId: async (jobSeekerId: string): Promise<ExperienceData[]> => {
    const response = await fetch(`${BASE_URL}/job-seeker-experience?job_seeker_id=${jobSeekerId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch experiences');
    return response.json();
  },

  create: async (data: ExperienceData): Promise<ExperienceData> => {
    const response = await fetch(`${BASE_URL}/job-seeker-experience`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create experience');
    return response.json();
  },

  update: async (id: string, data: ExperienceData): Promise<ExperienceData> => {
    const response = await fetch(`${BASE_URL}/job-seeker-experience/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update experience');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/job-seeker-experience/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete experience');
  }
};
