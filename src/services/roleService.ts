
const BASE_URL = 'http://localhost:8080/api';

export interface RoleData {
  id?: string;
  role_name: string;
  role_description?: string;
  role_permission?: string;
}

export const roleService = {
  getAll: async (): Promise<RoleData[]> => {
    const response = await fetch(`${BASE_URL}/roles`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch roles');
    return response.json();
  },

  getById: async (id: string): Promise<RoleData> => {
    const response = await fetch(`${BASE_URL}/roles/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch role');
    return response.json();
  },

  create: async (data: RoleData): Promise<RoleData> => {
    const response = await fetch(`${BASE_URL}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create role');
    return response.json();
  },

  update: async (id: string, data: RoleData): Promise<RoleData> => {
    const response = await fetch(`${BASE_URL}/roles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update role');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/roles/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete role');
  }
};
