import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { User, Organization, GoogleJob, Role } from '@/types/api';
import { Users, Building2, Briefcase, Plus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { toast, useToast } from '@/hooks/use-toast';
import UserEditModal from '@/components/admin/UserEditModal';
import { userService } from '@/services/userService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const USERS_PER_PAGE = 10;

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [jobs, setJobs] = useState<GoogleJob[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizations: 0,
    totalJobs: 0,
    activeUsers: 0
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
  const [userPage, setUserPage] = useState(pageFromUrl);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    if (userPage !== pageFromUrl) setUserPage(pageFromUrl);
    fetchUsers(pageFromUrl);
    fetchOrganizations();
    fetchJobs();
    fetchRoles();
  }, [pageFromUrl]);

  const fetchUsers = async (page = 1) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/paged?page=${page - 1}&size=${USERS_PER_PAGE}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.content || []);
        setTotalUsers(data.totalElements || 0);
        setStats(prev => ({
          ...prev,
          totalUsers: data.totalElements || 0,
          activeUsers: (data.content || []).filter((u: User) => !u.disabled).length
        }));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/organizations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
        setStats(prev => ({ ...prev, totalOrganizations: data.length }));
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/google-jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(Array.isArray(data.content) ? data.content : []);
        setStats(prev => ({ ...prev, totalJobs: data.totalElements || 0 }));
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

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

  const handleEditUser = (user: User) => {
    setEditUser(user);
    setEditModalOpen(true);
  };

  const handleSaveUser = async (data: Partial<User>) => {
    if (!editUser) return;
    // Defensive: Ensure organizationId and roleId are present
    let orgId = (data as any).organizationId || (organizations[0]?.id ?? '');
    let roleId = (data as any).roleId || '';
    if (!orgId || !roleId) {
      toast({ title: 'Error', description: 'Organization and Role are required.' });
      return;
    }
    try {
      // Map to camelCase for backend UserDTO
      const userData = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        profilePicture: data.profilePicture || '',
        roleId: roleId,
        organizationId: orgId,
        emailVerified: data.emailVerified ?? editUser.emailVerified ?? false,
        disabled: data.disabled ?? editUser.disabled ?? false,
        username: editUser.username,
      };
      await userService.update(editUser.id, userData);
      toast({ title: 'User updated', description: 'User details updated successfully.' });
      setEditModalOpen(false);
      setEditUser(null);
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update user.' });
    }
  };

  const handleDeleteUser = (userId: string) => {
    setDeleteUserId(userId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      await userService.delete(deleteUserId);
      toast({ title: 'User deleted', description: 'User deleted successfully.' });
      setDeleteDialogOpen(false);
      setDeleteUserId(null);
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete user.' });
    }
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ ...Object.fromEntries(searchParams.entries()), page: page.toString() });
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => navigate('/create-user')}>
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Organizations</p>
                <p className="text-2xl font-bold">{stats.totalOrganizations}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        {/* <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold">{stats.totalJobs}</p>
              </div>
              <Briefcase className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Users Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* <div className="space-y-4">
            {users.slice(0, 10).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{user.first_name} {user.last_name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.disabled ? "destructive" : "default"}>
                    {user.disabled ? "Disabled" : "Active"}
                  </Badge>
                  <Badge variant="outline">{user.role_id.roleName}</Badge>
                </div>
              </div>
            ))}
          </div> */}
          <UserManagementTable
            users={users}
            organizations={organizations}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            currentPage={userPage}
            totalUsers={totalUsers}
            usersPerPage={USERS_PER_PAGE}
            onPageChange={handlePageChange}
          />
          {/* {totalUsers > USERS_PER_PAGE && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                onClick={() => setUserPage(Math.max(1, userPage - 1))}
                disabled={userPage === 1}
              >
                Previous
              </button>
              <span className="px-2">Page {userPage} of {Math.ceil(totalUsers / USERS_PER_PAGE)}</span>
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                onClick={() => setUserPage(Math.min(Math.ceil(totalUsers / USERS_PER_PAGE), userPage + 1))}
                disabled={userPage === Math.ceil(totalUsers / USERS_PER_PAGE)}
              >
                Next
              </button>
            </div>
          )} */}
          <UserEditModal
            open={editModalOpen}
            onClose={() => { setEditModalOpen(false); setEditUser(null); }}
            user={editUser}
            roles={roles}
            organizations={organizations}
            onSave={handleSaveUser}
          />
          {deleteDialogOpen && (
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete User</DialogTitle>
                </DialogHeader>
                <div>Are you sure you want to delete this user?</div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={confirmDeleteUser}>Delete</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>

      {/* Organizations Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Organizations
          </CardTitle>
          <CardDescription>
            View all organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org) => (
              <div key={org.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{org.name || org.domain}</h3>
                <p className="text-sm text-gray-600 mt-1">{org.description}</p>
                <Badge variant={org.disabled ? "destructive" : "default"} className="mt-2">
                  {org.disabled ? "Disabled" : "Active"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Jobs Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            Jobs Overview
          </CardTitle>
          <CardDescription>
            Recent job postings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-sm text-gray-600">{job.companyName}</p>
                  <p className="text-sm text-gray-600">{job.location}</p>   
                </div>
                <div>
                  {job.salary && <Badge variant="secondary">{job.salary}</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
