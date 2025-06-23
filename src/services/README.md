# API Services Pattern

This directory contains centralized API services that follow a consistent pattern for making HTTP requests to the backend.

## Structure

### 1. `apiService.ts` - Base API Utilities
Contains common HTTP methods and utilities:
- `apiService.get(endpoint)` - GET requests
- `apiService.post(endpoint, data)` - POST requests  
- `apiService.put(endpoint, data)` - PUT requests
- `apiService.delete(endpoint)` - DELETE requests
- `apiService.getToken()` - Get auth token
- `apiService.setToken(token)` - Set auth token
- `apiService.removeToken()` - Remove auth token

### 2. Domain-Specific Services
Each service file handles a specific domain (users, roles, organizations, etc.):

#### Example: `roleService.ts`
```typescript
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
```

## Usage in Components

### Before (Inline API calls):
```typescript
const fetchRoles = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/roles', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      setRoles(data);
    }
  } catch (error) {
    console.error('Failed to fetch roles:', error);
  }
};
```

### After (Using service):
```typescript
import { roleService } from '@/services/roleService';

const fetchRoles = async () => {
  try {
    const data = await roleService.fetchRoles();
    setRoles(data);
  } catch (error) {
    console.error('Failed to fetch roles:', error);
    toast({
      title: "Error",
      description: "Failed to load roles",
      variant: "destructive",
    });
  }
};
```

## Benefits

1. **Centralized Logic**: All API calls are in one place
2. **Consistency**: Same error handling and auth headers across all requests
3. **Reusability**: Services can be used across multiple components
4. **Maintainability**: Easy to update API endpoints or add new functionality
5. **Type Safety**: TypeScript interfaces for all data structures
6. **Error Handling**: Consistent error handling patterns

## Creating New Services

1. Create a new file: `src/services/yourDomainService.ts`
2. Import `apiService`
3. Define your data interface
4. Create service methods using `apiService.get/post/put/delete`

### Example:
```typescript
import { apiService } from './apiService';

export interface YourData {
  id: string;
  name: string;
  // ... other properties
}

export const yourDomainService = {
  getAll: async (): Promise<YourData[]> => {
    return apiService.get('/your-endpoint');
  },

  getById: async (id: string): Promise<YourData> => {
    return apiService.get(`/your-endpoint/${id}`);
  },

  create: async (data: YourData): Promise<YourData> => {
    return apiService.post('/your-endpoint', data);
  },

  update: async (id: string, data: YourData): Promise<YourData> => {
    return apiService.put(`/your-endpoint/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiService.delete(`/your-endpoint/${id}`);
  }
};
```

## Error Handling

All services throw errors that can be caught and handled in components:

```typescript
try {
  const roles = await roleService.fetchRoles();
  setRoles(roles);
} catch (error) {
  console.error('Failed to fetch roles:', error);
  // Handle error (show toast, set error state, etc.)
}
``` 