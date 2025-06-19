
const BASE_URL = 'http://localhost:8080/api';

export interface OrganizationData {
  id?: string;
  name?: string;
  description: string;
  domain: string;
  disabled: boolean;
  logo_img_src?: string;
}

export const organizationService = {
  getAll: async (): Promise<OrganizationData[]> => {
    const response = await fetch(`${BASE_URL}/organizations`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch organizations');
    return response.json();
  },

  getById: async (id: string): Promise<OrganizationData> => {
    const response = await fetch(`${BASE_URL}/organizations/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch organization');
    return response.json();
  },

  create: async (data: OrganizationData): Promise<OrganizationData> => {
    const response = await fetch(`${BASE_URL}/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create organization');
    return response.json();
  },

  update: async (id: string, data: OrganizationData): Promise<OrganizationData> => {
    const response = await fetch(`${BASE_URL}/organizations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update organization');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/organizations/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete organization');
  }
};
