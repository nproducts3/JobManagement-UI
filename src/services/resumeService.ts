
const BASE_URL = 'http://localhost:8080/api';

export interface ResumeData {
  id?: string;
  googlejob_id: string;
  resume_file: string;
  resume_text?: string;
  match_percentage?: number;
  uploaded_at?: string;
}

export const resumeService = {
  getAll: async (): Promise<ResumeData[]> => {
    const response = await fetch(`${BASE_URL}/job-resumes`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch resumes');
    return response.json();
  },

  getById: async (id: string): Promise<ResumeData> => {
    const response = await fetch(`${BASE_URL}/job-resumes/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch resume');
    return response.json();
  },

  create: async (formData: FormData): Promise<ResumeData> => {
    const response = await fetch(`${BASE_URL}/job-resumes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload resume');
    return response.json();
  },

  update: async (id: string, data: ResumeData): Promise<ResumeData> => {
    const response = await fetch(`${BASE_URL}/job-resumes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update resume');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/job-resumes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete resume');
  }
};
