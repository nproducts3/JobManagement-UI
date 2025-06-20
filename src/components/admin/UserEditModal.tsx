import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { User, Role, Organization } from '@/types/api';
import { useForm } from 'react-hook-form';

interface UserEditModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  roles: Role[];
  organizations: Organization[];
  onSave: (data: Partial<User>) => Promise<void>;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({ open, onClose, user, roles, organizations, onSave }) => {
  const methods = useForm<any>({
    defaultValues: user
      ? {
          ...user,
          organizationId: user.organization|| '',
          roleId: user.role?.id || '',
        }
      : {},
  });

  React.useEffect(() => {
    // If user has no organization_id, default to first org
    let orgId = user?.organization || '';
    if (!orgId && organizations.length > 0) {
      orgId = organizations[0].id;
    }
    methods.reset({
      ...user,
      organizationId: orgId,
      roleId: user?.role?.id || '',
    });
  }, [user, organizations, methods]);

  const onSubmit = async (data: any) => {
    // Map to backend expected keys
    const mappedData = {
      ...data,
      organization_id: data.organizationId,
      role_id: data.roleId,
    };
    await onSave(mappedData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <Form {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <FormField
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="organizationId"
              rules={{ required: 'Organization is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full border rounded px-2 py-1" required>
                      <option value="">Select organization</option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name || org.domain}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full border rounded px-2 py-1">
                      <option value="">Select role</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.roleName}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="disabled"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banned</FormLabel>
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email_verified"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Verified</FormLabel>
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={methods.formState.isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={methods.formState.isSubmitting}>Save</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditModal; 