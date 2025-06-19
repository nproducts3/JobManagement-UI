
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '@/types/api';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
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
      // Fetch user data when token exists
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
        
        // Fetch role data
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
    // Demo login logic
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

    // Try real backend login
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
      throw new Error('Invalid credentials. Try demo emails: jobseeker@demo.com, admin@demo.com, or employer@demo.com with password: demo123');
    }
  };

  const register = async (userData: Partial<User>) => {
    // Map frontend field names to backend field names
    const backendUserData = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      firstName: userData.first_name, // Map to backend field name
      lastName: userData.last_name,   // Map to backend field name
      phoneNumber: userData.phone_number, // Map to backend field name
      role_id: userData.role_id || 'ROLE_JOBSEEKER',
      organization_id: userData.organization_id || 'default-org-id',
    };

    const response = await fetch('http://localhost:8080/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendUserData),
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
