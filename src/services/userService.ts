
const BASE_URL = 'http://localhost:8080/api';

export interface UserData {
  id?: string;
  username: string;
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  profile_picture?: string;
  role_id: string;
  organization_id: string;
  email_verified?: boolean;
  disabled?: boolean;
  created_at?: string;
  last_login?: string;
}

export const userService = {
  getAll: async (): Promise<UserData[]> => {
    const response = await fetch(`${BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  getById: async (id: string): Promise<UserData> => {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  create: async (data: UserData): Promise<UserData> => {
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  update: async (id: string, data: UserData): Promise<UserData> => {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete user');
  }
};
