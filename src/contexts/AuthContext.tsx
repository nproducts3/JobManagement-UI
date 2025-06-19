
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '@/types/api';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  roleId: string;
  organizationId: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        const roleResponse = await fetch(`http://localhost:8080/api/roles/${userData.role_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          setRole(roleData);
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const demoUsers = {
      'jobseeker@demo.com': {
        id: 'demo-jobseeker-id',
        username: 'jobseeker_demo',
        email: 'jobseeker@demo.com',
        first_name: 'John',
        last_name: 'Seeker',
        role_id: 'ROLE_JOBSEEKER',
        organization_id: 'demo-org-id',
        phone_number: '+1234567890'
      },
      'admin@demo.com': {
        id: 'demo-admin-id',
        username: 'admin_demo',
        email: 'admin@demo.com',
        first_name: 'Admin',
        last_name: 'User',
        role_id: 'ROLE_SUPER_ADMIN',
        organization_id: 'demo-org-id',
        phone_number: '+1234567891'
      },
      'employer@demo.com': {
        id: 'demo-employer-id',
        username: 'employer_demo',
        email: 'employer@demo.com',
        first_name: 'Jane',
        last_name: 'Employer',
        role_id: 'ROLE_EMPLOYER',
        organization_id: 'demo-org-id',
        phone_number: '+1234567892'
      },
      'employee@demo.com': {
        id: 'demo-employee-id',
        username: 'employee_demo',
        email: 'employee@demo.com',
        first_name: 'Mike',
        last_name: 'Employee',
        role_id: 'ROLE_EMPLOYEE',
        organization_id: 'demo-org-id',
        phone_number: '+1234567893'
      }
    };

    const demoRoles = {
      'ROLE_JOBSEEKER': {
        id: 'ROLE_JOBSEEKER',
        role_name: 'ROLE_JOBSEEKER',
        role_description: 'Job Seeker Role',
        role_permission: 'READ'
      },
      'ROLE_SUPER_ADMIN': {
        id: 'ROLE_SUPER_ADMIN',
        role_name: 'ROLE_SUPER_ADMIN',
        role_description: 'Super Admin Role',
        role_permission: 'ALL'
      },
      'ROLE_EMPLOYER': {
        id: 'ROLE_EMPLOYER',
        role_name: 'ROLE_EMPLOYER',
        role_description: 'Employer Role',
        role_permission: 'WRITE'
      },
      'ROLE_EMPLOYEE': {
        id: 'ROLE_EMPLOYEE',
        role_name: 'ROLE_EMPLOYEE',
        role_description: 'Employee Role',
        role_permission: 'READ'
      }
    };

    const demoUser = demoUsers[email as keyof typeof demoUsers];
    if (demoUser && password === 'demo123') {
      const mockToken = `demo-token-${Date.now()}`;
      localStorage.setItem('token', mockToken);
      setToken(mockToken);
      setUser(demoUser as User);
      setRole(demoRoles[demoUser.role_id as keyof typeof demoRoles] as Role);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const { token: authToken, user: userData } = data;
      
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(userData);
    } catch (error) {
      throw new Error('Invalid credentials. Try demo emails: jobseeker@demo.com, admin@demo.com, employer@demo.com, or employee@demo.com with password: demo123');
    }
  };

  const register = async (userData: RegisterData) => {
    const response = await fetch('http://localhost:8080/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const value = {
    user,
    role,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
