import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '@/types/api';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{redirectPath: string}>;
  register: (userData: RegisterData) => Promise<{redirectPath: string}>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
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

  // --- SESSION TIMEOUT LOGIC ---
  useEffect(() => {
    const checkSession = () => {
      const expiresAt = localStorage.getItem("expiresAt");
      if (expiresAt && Date.now() > parseInt(expiresAt, 10)) {
        // Session expired
        localStorage.removeItem("token");
        localStorage.removeItem("expiresAt");
        setToken(null);
        setUser(null);
        setRole(null);
        window.location.href = "/login";
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 60 * 1000); // check every minute
    return () => clearInterval(interval);
  }, []);
  // --- END SESSION TIMEOUT LOGIC ---

  useEffect(() => {
    if (token) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setUser(null);
        setRole(null);
        setIsLoading(false);
        return;
      }
      const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        if (userData.role && userData.role.roleName) {
          setRole(userData.role);
        } else if (userData.roleId) {
          // Fallback: fetch role by roleId if role object is not present
          const roleResponse = await fetch(`http://localhost:8080/api/roles/${userData.roleId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (roleResponse.ok) {
            const roleData = await roleResponse.json();
            setRole(roleData);
          } else {
            setRole(null);
          }
        } else {
          setRole(null);
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

  const getDashboardPath = (roleName: string): string => {
    switch (roleName) {
      case 'ROLE_ADMIN':
        return '/admin-dashboard';
      case 'ROLE_EMPLOYEE':
        return '/employer-dashboard';
      case 'ROLE_JOBSEEKER':
      default:
        return '/dashboard';
    }
  };

  const login = async (email: string, password: string) => {
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
      const { token: authToken, id, email: userEmail, role } = data;

      localStorage.setItem('token', authToken);
      setToken(authToken);
      // Store userId in localStorage for later use
      localStorage.setItem('userId', id);

      // --- SET SESSION EXPIRATION ---
      const oneHour = 60 * 60 * 1000;
      const expiresAt = Date.now() + oneHour;
      localStorage.setItem("expiresAt", expiresAt.toString());
      // --- END SESSION EXPIRATION ---

      // Set user and role in context (minimal, will be replaced by fetchUserData)
      setUser({ id, email: userEmail, roleId: role } as any);
      setRole({ id: role, roleName: role } as any);

      // Redirect based on role
      const redirectPath = getDashboardPath(role);
      return { redirectPath };
    } catch (error) {
      throw new Error('Invalid credentials.');
    }
  };

  const register = async (userData: RegisterData) => {
    const response = await fetch('http://localhost:8080/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        roleId: userData.roleId,
        organizationId: userData.organizationId,
      }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    const redirectPath = '/login';
    return { redirectPath };
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
    setToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
