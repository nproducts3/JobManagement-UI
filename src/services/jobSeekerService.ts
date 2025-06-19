
const BASE_URL = 'http://localhost:8080/api';

export interface JobSeekerData {
  id?: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  location?: string;
  phone?: string;
  desired_salary?: string;
  preferred_job_types?: string;
}

export const jobSeekerService = {
  getAll: async (): Promise<JobSeekerData[]> => {
    const response = await fetch(`${BASE_URL}/job-seekers`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch job seekers');
    return response.json();
  },

  getById: async (id: string): Promise<JobSeekerData> => {
    const response = await fetch(`${BASE_URL}/job-seekers/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch job seeker');
    return response.json();
  },

  getByUserId: async (userId: string): Promise<JobSeekerData[]> => {
    const response = await fetch(`${BASE_URL}/job-seekers?user_id=${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch job seeker by user ID');
    return response.json();
  },

  create: async (data: Omit<JobSeekerData, 'id'>): Promise<JobSeekerData> => {
    const response = await fetch(`${BASE_URL}/job-seekers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create job seeker');
    return response.json();
  },

  update: async (id: string, data: Partial<JobSeekerData>): Promise<JobSeekerData> => {
    const response = await fetch(`${BASE_URL}/job-seekers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update job seeker');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/job-seekers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete job seeker');
  }
};
