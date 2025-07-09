
const BASE_URL = 'http://localhost:8080/api';

export interface SkillData {
  id?: string;
  jobSeekerId: string;
  skillName: string;
}

export const skillsService = {
  getAll: async (): Promise<SkillData[]> => {
    const response = await fetch(`${BASE_URL}/job-seeker-skills`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch skills');
    return response.json();
  },

  getById: async (id: string): Promise<SkillData> => {
    const response = await fetch(`${BASE_URL}/job-seeker-skills/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch skill');
    return response.json();
  },

  getByJobSeekerId: async (jobSeekerId: string): Promise<SkillData[]> => {
    const response = await fetch(`${BASE_URL}/job-seeker-skills?job_seeker_id=${jobSeekerId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch skills');
    return response.json();
  },

  create: async (data: SkillData): Promise<SkillData> => {
    const response = await fetch(`${BASE_URL}/job-seeker-skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create skill');
    return response.json();
  },

  update: async (id: string, data: SkillData): Promise<SkillData> => {
    const response = await fetch(`${BASE_URL}/job-seeker-skills/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update skill');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/job-seeker-skills/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete skill');
  }
};
