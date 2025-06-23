import { apiService } from './apiService';

export interface RoleData {
  id?: string;
  roleName: string;
  roleDescription?: string;
  rolePermission?: string;
}

export const roleService = {
  getAll: async (): Promise<RoleData[]> => {
    return apiService.get('/roles');
  },

  // Alias for getAll - more descriptive name
  fetchRoles: async (): Promise<RoleData[]> => {
    return roleService.getAll();
  },

  getById: async (id: string): Promise<RoleData> => {
    return apiService.get(`/roles/${id}`);
  },

  create: async (data: RoleData): Promise<RoleData> => {
    return apiService.post('/roles', data);
  },

  update: async (id: string, data: RoleData): Promise<RoleData> => {
    return apiService.put(`/roles/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiService.delete(`/roles/${id}`);
  }
};
