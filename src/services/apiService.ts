const BASE_URL = 'http://localhost:8080/api';

// Common API service utilities
export const apiService = {
  // Generic GET request
  get: async (endpoint: string): Promise<any> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error(`Failed to fetch from ${endpoint}`);
    return response.json();
  },

  // Generic POST request
  post: async (endpoint: string, data: any): Promise<any> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to post to ${endpoint}`);
    return response.json();
  },

  // Generic PUT request
  put: async (endpoint: string, data: any): Promise<any> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to update ${endpoint}`);
    return response.json();
  },

  // Generic DELETE request
  delete: async (endpoint: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error(`Failed to delete ${endpoint}`);
  },

  // Get auth token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Set auth token
  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },

  // Remove auth token
  removeToken: (): void => {
    localStorage.removeItem('token');
  }
};

// Common data fetching hooks pattern
export const createDataFetcher = <T>(
  endpoint: string,
  errorMessage: string = 'Failed to fetch data'
) => {
  return async (): Promise<T[]> => {
    try {
      return await apiService.get(endpoint);
    } catch (error) {
      console.error(errorMessage, error);
      throw error;
    }
  };
};

// Example usage:
// export const fetchUsers = createDataFetcher<User>('/users', 'Failed to fetch users');
// export const fetchOrganizations = createDataFetcher<Organization>('/organizations', 'Failed to fetch organizations'); 