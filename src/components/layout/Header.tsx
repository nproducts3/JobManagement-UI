import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut } from 'lucide-react';

export const Header = () => {
  const { user, role, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (role?.roleName === 'ROLE_SUPER_ADMIN') return '/admin-dashboard';
    if (role?.roleName === 'ROLE_EMPLOYER') return '/employer-dashboard';
    if (role?.roleName === 'ROLE_JOBSEEKER') return '/dashboard';
    
    return '/dashboard';
  };

  // Prevent header UI flash: don't render until auth state is loaded
  if (isLoading) {
    return null; // Or a spinner if you prefer
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              EnsarJob
            </Link>
            <nav className="ml-8 flex space-x-4">
              <Link to="/google-jobs" className="text-gray-600 hover:text-gray-900">
                Jobs
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user?.firstName} {user?.lastName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                    Dashboard
                  </DropdownMenuItem>
                  {role?.roleName === 'ROLE_JOBSEEKER' && (
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      Settings
                    </DropdownMenuItem>
                  )}
                  {role?.roleName === 'ROLE_SUPER_ADMIN' && (
                    <DropdownMenuItem onClick={() => navigate('/create-user')}>
                      Create User
                    </DropdownMenuItem>
                  )}
                  {role?.roleName === 'ROLE_EMPLOYER' && (
                    <DropdownMenuItem onClick={() => navigate('/post-job')}>
                      Post Job
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
