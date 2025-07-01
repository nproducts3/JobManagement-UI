import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Phone, Building, Calendar, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UserProfile = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const getRoleName = (roleId: string) => {
    switch (roleId) {
      case 'ROLE_ADMIN':
        return ' Admin';
      case 'ROLE_EMPLOYEE':
        return 'Employee';
      case 'ROLE_JOBSEEKER':
        return 'Job Seeker';
      default:
        return roleId;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.profilePicture} />
            <AvatarFallback className="text-2xl">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-2xl">{user.firstName} {user.lastName}</CardTitle>
        <CardDescription>@{user.username}</CardDescription>
        <div className="flex justify-center mt-2">
          <Badge variant="outline">
            {getRoleName(user.role?.roleName || role?.roleName || "Unknown")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          
          {user.phoneNumber && (
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-gray-600">{user.phoneNumber}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <Building className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Organization</p>
              <p className="text-sm text-gray-600">Default Organization</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Status</p>
              <Badge variant={user.disabled ? "destructive" : "default"}>
                {user.disabled ? "Disabled" : "Active"}
              </Badge>
            </div>
          </div>
        </div>
        
        {user.createdDateTime && (
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Member since</p>
              <p className="text-sm text-gray-600">
                {new Date(user.createdDateTime).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex justify-center pt-4">
          {role?.roleName === 'ROLE_JOBSEEKER' && (
            <Button onClick={() => navigate('/settings')} className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Edit Profile</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
