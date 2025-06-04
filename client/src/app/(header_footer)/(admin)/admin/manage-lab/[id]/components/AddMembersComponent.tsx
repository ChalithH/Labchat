"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, UserPlus, Users, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';
import api from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AvailableUser {
  id: number;
  firstName: string;
  lastName: string;
  displayName: string;
  loginEmail: string;
  jobTitle: string | null;
  office: string | null;
  isFormerMember: boolean;
}

interface AvailableUsersPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface LabRoleData {
  id: number;
  name: string;
  permissionLevel: number;
}

interface AddMembersComponentProps {
  labId: number;
  availableLabRoles: LabRoleData[];
  onUserAdded: () => void; // Callback to refresh main members list
}

const AddMembersComponent: React.FC<AddMembersComponentProps> = ({ 
  labId, 
  availableLabRoles, 
  onUserAdded 
}) => {
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<AvailableUsersPagination>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0
  });

  // State for add user modal
  const [selectedUser, setSelectedUser] = useState<AvailableUser | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedLabRoleId, setSelectedLabRoleId] = useState<string>('');
  const [isAddingUser, setIsAddingUser] = useState(false);

  const fetchAvailableUsers = useCallback(async (page: number = 1, search: string = '') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (search.trim()) {
        queryParams.append('search', search.trim());
      }
      
      const response = await api.get(`/admin/lab/${labId}/available-users?${queryParams.toString()}`);
      setAvailableUsers(response.data.users);
      setPagination(response.data.pagination);
      setHasLoaded(true);
    } catch (err: any) {
      console.error("Failed to fetch available users:", err);
      setError(err.response?.data?.error || "Failed to load available users");
    } finally {
      setIsLoading(false);
    }
  }, [labId, pagination.limit]);

  const handleSearch = useCallback(() => {
    fetchAvailableUsers(1, searchQuery);
  }, [fetchAvailableUsers, searchQuery]);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchAvailableUsers(newPage, searchQuery);
    }
  }, [fetchAvailableUsers, searchQuery, pagination.totalPages]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    fetchAvailableUsers(1, '');
  }, [fetchAvailableUsers]);

  const handleOpenAddUserModal = useCallback((user: AvailableUser) => {
    setSelectedUser(user);
    setSelectedLabRoleId('');
    setIsAddUserModalOpen(true);
  }, []);

  const handleCloseAddUserModal = useCallback(() => {
    setSelectedUser(null);
    setSelectedLabRoleId('');
    setIsAddUserModalOpen(false);
  }, []);

  const handleAddUser = useCallback(async () => {
    if (!selectedUser || !selectedLabRoleId) return;

    setIsAddingUser(true);
    try {
      const response = await api.post(`/admin/lab/${labId}/add-user`, {
        userId: selectedUser.id,
        labRoleId: parseInt(selectedLabRoleId)
      });

      toast.success(response.data.message);
      
      // Remove the user from the available users list
      setAvailableUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      
      // Update pagination count
      setPagination(prev => ({
        ...prev,
        totalCount: Math.max(0, prev.totalCount - 1),
        totalPages: Math.ceil(Math.max(0, prev.totalCount - 1) / prev.limit)
      }));

      // Notify parent component to refresh members list
      onUserAdded();
      
      handleCloseAddUserModal();
    } catch (err: any) {
      console.error("Failed to add user to lab:", err);
      toast.error(err.response?.data?.error || "Failed to add user to lab");
    } finally {
      setIsAddingUser(false);
    }
  }, [selectedUser, selectedLabRoleId, labId, onUserAdded, handleCloseAddUserModal]);

  // Load data when component becomes active (tab selected)
  useEffect(() => {
    if (!hasLoaded) {
      fetchAvailableUsers(1, '');
    }
  }, [hasLoaded, fetchAvailableUsers]);

  // Filter lab roles to exclude "Former Member" role (permission level -1)
  const selectableLabRoles = availableLabRoles.filter(role => role.permissionLevel >= 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add Members
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search Section */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="userSearch" className="text-sm">Search Users</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="userSearch"
                  type="text"
                  placeholder="Search by name, email, or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  disabled={isLoading}
                />
                <Button onClick={handleSearch} disabled={isLoading} className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
                {searchQuery && (
                  <Button variant="outline" onClick={handleClearSearch} disabled={isLoading}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading available users...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-destructive">
            <p className="text-center">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => fetchAvailableUsers(pagination.page, searchQuery)}>
              Retry
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && hasLoaded && availableUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-500">
            <Users className="h-12 w-12 mb-4" />
            {searchQuery ? (
              <div className="text-center">
                <p className="text-lg mb-2">No users found</p>
                <p className="text-sm">Try adjusting your search terms</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg mb-2">All users are already members</p>
                <p className="text-sm">There are no available users to add to this lab</p>
              </div>
            )}
          </div>
        )}

        {/* Users List */}
        {!isLoading && !error && availableUsers.length > 0 && (
          <div className="space-y-4">
            {availableUsers.map((user) => (
              <div key={user.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-2 sm:mb-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-lg font-semibold">{user.displayName}</p>
                    {user.isFormerMember && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Former Member
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Email: {user.loginEmail}</p>
                  {user.jobTitle && (
                    <p className="text-sm text-gray-500">Title: {user.jobTitle}</p>
                  )}
                  {user.office && (
                    <p className="text-sm text-gray-500">Office: {user.office}</p>
                  )}
                </div>
                <div className="flex items-center">
                  <Button 
                    onClick={() => handleOpenAddUserModal(user)} 
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    {user.isFormerMember ? (
                      <>
                        <UserCheck className="h-4 w-4" />
                        Reactivate
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Add to Lab
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Pagination */}
      {!isLoading && !error && pagination.totalPages > 1 && (
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
            <span className="ml-2">({pagination.totalCount} total users)</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}

      {/* Add User Modal */}
      {selectedUser && (
        <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedUser.isFormerMember ? 'Reactivate User' : 'Add User to Lab'}
              </DialogTitle>
              <DialogDescription>
                {selectedUser.isFormerMember 
                  ? `Reactivate ${selectedUser.displayName} as a member of this lab with a new role.`
                  : `Add ${selectedUser.displayName} to this lab with a specific role.`
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="userInfo" className="text-sm font-medium">User</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">{selectedUser.displayName}</p>
                  <p className="text-sm text-gray-600">{selectedUser.loginEmail}</p>
                  {selectedUser.jobTitle && (
                    <p className="text-sm text-gray-500">{selectedUser.jobTitle}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="labRoleSelect" className="text-sm font-medium">Lab Role</Label>
                <Select 
                  value={selectedLabRoleId}
                  onValueChange={setSelectedLabRoleId}
                  disabled={isAddingUser}
                >
                  <SelectTrigger id="labRoleSelect" className="mt-1">
                    <SelectValue placeholder="Select a lab role" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectableLabRoles.map(role => (
                      <SelectItem key={role.id} value={String(role.id)}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectableLabRoles.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">No lab roles available to assign.</p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={handleCloseAddUserModal}
                disabled={isAddingUser}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddUser}
                disabled={isAddingUser || !selectedLabRoleId || selectableLabRoles.length === 0}
              >
                {isAddingUser ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {selectedUser.isFormerMember ? 'Reactivating...' : 'Adding...'}
                  </>
                ) : (
                  selectedUser.isFormerMember ? 'Reactivate User' : 'Add User'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default AddMembersComponent; 