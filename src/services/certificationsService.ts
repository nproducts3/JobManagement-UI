
const BASE_URL = 'http://localhost:8080/api';

export interface CertificationData {
  id?: string;
  jobSeekerId: string;
  certificationName?: string;
}

export const certificationsService = {
  getAll: async (): Promise<CertificationData[]> => {
    const response = await fetch(`${BASE_URL}/job-seeker-certifications`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch certifications');
    return response.json();
  },

  getById: async (id: string): Promise<CertificationData> => {
    const response = await fetch(`${BASE_URL}/job-seeker-certifications/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch certification');
    return response.json();
  },

  getByJobSeekerId: async (jobSeekerId: string): Promise<CertificationData[]> => {
    const response = await fetch(`${BASE_URL}/job-seeker-certifications?job_seeker_id=${jobSeekerId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch certifications');
    return response.json();
  },

  create: async (data: CertificationData): Promise<CertificationData> => {
    const response = await fetch(`${BASE_URL}/job-seeker-certifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create certification');
    return response.json();
  },

  update: async (id: string, data: CertificationData): Promise<CertificationData> => {
    const response = await fetch(`${BASE_URL}/job-seeker-certifications/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update certification');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/job-seeker-certifications/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete certification');
  }
};
