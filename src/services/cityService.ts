
const BASE_URL = 'http://localhost:8080/api';

export interface City {
  id: number;
  name: string;
  state?: string;
  country?: string;
  population?: number;
  growth?: number;
}

export const cityService = {
  getAll: async (): Promise<City[]> => {
    const response = await fetch(`${BASE_URL}/cities`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch cities');
    return response.json();
  },

  getById: async (id: number): Promise<City> => {
    const response = await fetch(`${BASE_URL}/cities/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch city');
    return response.json();
  },

  create: async (data: Omit<City, 'id'>): Promise<City> => {
    const response = await fetch(`${BASE_URL}/cities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create city');
    return response.json();
  },

  update: async (id: number, data: Partial<City>): Promise<City> => {
    const response = await fetch(`${BASE_URL}/cities/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update city');
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/cities/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete city');
  }
};
