
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
  },

  // Upload a new certification with file
  uploadCertification: async (formData: FormData) => {
    const response = await fetch(`${BASE_URL}/job-seeker-certifications/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to upload certification');
    return response.json();
  },

  // Update an existing certification with file
  updateCertificationWithFile: async (id: string, formData: FormData) => {
    const response = await fetch(`${BASE_URL}/job-seeker-certifications/${id}/upload`, {
      method: 'PUT',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to update certification');
    return response.json();
  },

  // Get certifications by job seeker
  getByJobSeekerId: async (jobSeekerId: string) => {
    const response = await fetch(`${BASE_URL}/job-seeker-certifications/job-seeker/${jobSeekerId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch certifications');
    return response.json();
  },
};
