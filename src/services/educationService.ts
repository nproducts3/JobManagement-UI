
const BASE_URL = 'http://localhost:8080/api';

export interface EducationData {
  id?: string;
  job_seeker_id: string;
  degree?: string;
  university?: string;
  graduation_year?: number;
}

export const educationService = {
  getAll: async (): Promise<EducationData[]> => {
    const response = await fetch(`${BASE_URL}/job-seeker-education`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch education records');
    return response.json();
  },

  getById: async (id: string): Promise<EducationData> => {
    const response = await fetch(`${BASE_URL}/job-seeker-education/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch education record');
    return response.json();
  },

  getByJobSeekerId: async (jobSeekerId: string): Promise<EducationData[]> => {
    const response = await fetch(`${BASE_URL}/job-seeker-education?job_seeker_id=${jobSeekerId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch education records');
    return response.json();
  },

  create: async (data: EducationData): Promise<EducationData> => {
    const response = await fetch(`${BASE_URL}/job-seeker-education`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create education record');
    return response.json();
  },

  update: async (id: string, data: EducationData): Promise<EducationData> => {
    const response = await fetch(`${BASE_URL}/job-seeker-education/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update education record');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/job-seeker-education/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete education record');
  }
};
