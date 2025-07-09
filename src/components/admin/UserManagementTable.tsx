import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { User, Role, Organization } from '@/types/api';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { roleService, RoleData } from '@/services/roleService';

interface UserManagementTableProps {
  users: User[];
  organizations: Organization[];
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  currentPage: number;
  totalUsers: number;
  usersPerPage: number;
  onPageChange: (page: number) => void;
}

export const UserManagementTable = ({ users, organizations, onEditUser, onDeleteUser, currentPage, totalUsers, usersPerPage, onPageChange }: UserManagementTableProps) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [roles, setRoles] = useState<RoleData[]>([]);
  const { toast } = useToast();
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await roleService.fetchRoles();
      console.log('Fetched roles:', data);
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

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      onDeleteUser(userId);
      toast({
        title: "User Deleted",
        description: `${userName} has been deleted successfully.`,
      });
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.disabled) {
      return <Badge variant="destructive">Banned</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
  };

  const getRoleName = (roleId: string) => {
    if (!roleId) return 'Unknown';
    
    // Use the same role labels mapping as in CreateUser
    const ROLE_LABELS: Record<string, string> = {
      'ROLE_ADMIN': 'Admin',
      'ROLE_SUPER_ADMIN': 'Super Admin',
      'ROLE_JOBSEEKER': 'Job Seeker',
      'ROLE_EMPLOYER': 'Employer',
      
    };
    
    return ROLE_LABELS[roleId] || roleId;
  };

  const getOrganizationName = (organizationId: string) => {
    const organization = organizations.find(org => org.id === organizationId);
    return organization?.name || organization?.domain || 'N/A';
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedUsers.length === users.length && users.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone number</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback>
                      {user.firstName?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-gray-600">
                {user.phoneNumber || 'N/A'}
              </TableCell>
              <TableCell className="text-gray-600">
                {getOrganizationName(user.organizationId)}
              </TableCell>
              <TableCell>
                {(() => {
                  console.log('User roleId:', user.roleId, 'Available roles:', roles);
                  let roleStr = 'Unknown';
                  
                  // Find the role by roleId
                  const userRole = roles.find(role => role.id === user.roleId);
                  if (userRole) {
                    roleStr = userRole.roleName;
                  }
                  
                  console.log('Found role:', userRole, 'Role name:', roleStr);
                  return <span className="text-gray-900">{getRoleName(roleStr)}</span>;
                })()}
              </TableCell>
              <TableCell>
                {getStatusBadge(user)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditUser(user)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {/* Pagination numbers logic */}
          {totalUsers > 50 ? (
            <>
              <button
                className={`px-3 py-1 rounded border ${currentPage === 1 ? 'bg-blue-600 text-white' : ''}`}
                onClick={() => onPageChange(1)}
              >
                1
              </button>
              <button
                className={`px-3 py-1 rounded border ${currentPage === 2 ? 'bg-blue-600 text-white' : ''}`}
                onClick={() => onPageChange(2)}
              >
                2
              </button>
              <button
                className={`px-3 py-1 rounded border ${currentPage === 3 ? 'bg-blue-600 text-white' : ''}`}
                onClick={() => onPageChange(3)}
              >
                3
              </button>
              <span className="px-2">...</span>
            </>
          ) : (
            Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`px-3 py-1 rounded border ${currentPage === pageNum ? 'bg-blue-600 text-white' : ''}`}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </button>
            ))
          )}
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
