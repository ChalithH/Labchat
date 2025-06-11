"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit, Trash2, Plus, CheckCircle, Activity } from 'lucide-react';
import { toast } from "sonner";
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { MemberStatus, ContactType } from '../types/profile.types';
import AddStatusDialog from './AddStatusDialog';
import EditStatusDialog from './EditStatusDialog';
import DeleteStatusDialog from './DeleteStatusDialog';

interface Status {
  id: number;
  statusName: string;
  statusWeight: number;
}

interface StatusTableProps {
  memberId: number;
  userId: number;
  initialStatuses?: MemberStatus[];
  canEdit?: boolean;
}

const getStatusColor = (isActive: boolean) => {
  return isActive 
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-gray-100 text-gray-800 border-gray-200';
};

const formatStatusWeight = (weight: number) => {
  const weightLabels: { [key: number]: string } = {
    10: 'High Priority',
    5: 'Medium Priority',
    0: 'Low Priority'
  };
  return weightLabels[weight] || `Priority ${weight}`;
};

export default function StatusTable({ 
  memberId, 
  userId, 
  initialStatuses = [], 
  canEdit = false 
}: StatusTableProps) {
  const router = useRouter();
  const [memberStatuses, setMemberStatuses] = useState<MemberStatus[]>(initialStatuses);
  const [availableStatuses, setAvailableStatuses] = useState<Status[]>([]);
  const [availableContacts, setAvailableContacts] = useState<ContactType[]>([]);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<MemberStatus | null>(null);
  const [deletingStatus, setDeletingStatus] = useState<MemberStatus | null>(null);

  // Fetch available statuses and contacts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusesResponse, contactsResponse] = await Promise.all([
          api.get('/member/statuses'),
          api.get(`/profile/contacts/user/${userId}`)
        ]);
        
        setAvailableStatuses(statusesResponse.data);
        setAvailableContacts(contactsResponse.data);
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        if (err.response?.status !== 404) {
          toast.error('Failed to load statuses and contacts');
        }
      }
    };

    if (canEdit) {
      fetchData();
    }
  }, [memberId, userId, canEdit]);

  // Refresh contacts when page gains focus (to catch new contacts created)
  useEffect(() => {
    const handleFocus = async () => {
      if (canEdit) {
        try {
          const contactsResponse = await api.get(`/profile/contacts/user/${userId}`);
          setAvailableContacts(contactsResponse.data);
        } catch (err: any) {
          // Silently fail for contact refresh
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [userId, canEdit]);

  const handleSetActive = async (statusId: number) => {
    setProcessingId(statusId);
    try {
      await api.post('/member/set-status', {
        memberId: memberId,
        statusId: statusId
      });

      // Update local state
      setMemberStatuses(prev =>
        prev.map(status => ({
          ...status,
          isActive: status.status.id === statusId
        }))
      );

      toast.success('Status updated successfully');
      router.refresh();
    } catch (err: any) {
      console.error('Failed to set status:', err);
      toast.error(err.response?.data?.error || 'Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAdd = () => {
    setAddDialogOpen(true);
  };

  const handleEdit = (status: MemberStatus) => {
    setEditingStatus(status);
    setEditDialogOpen(true);
  };

  const handleDelete = (status: MemberStatus) => {
    setDeletingStatus(status);
    setDeleteDialogOpen(true);
  };

  const onStatusAdded = (newStatus: MemberStatus) => {
    setMemberStatuses(prev => [...prev, newStatus]);
    // Refresh contacts to catch any new ones that might have been created
    if (canEdit) {
      api.get(`/profile/contacts/user/${userId}`)
        .then(response => setAvailableContacts(response.data))
        .catch(() => {}); // Silently fail
    }
    router.refresh();
  };

  const onStatusUpdated = (updatedStatus: MemberStatus) => {
    setMemberStatuses(prev =>
      prev.map(status => 
        status.id === updatedStatus.id ? updatedStatus : status
      )
    );
    router.refresh();
  };

  const onStatusDeleted = (deletedStatusId: number) => {
    setMemberStatuses(prev => 
      prev.filter(status => status.id !== deletedStatusId)
    );
    router.refresh();
  };

  // Sort statuses: active first, then by priority (higher weight = higher priority)
  const sortedStatuses = [...memberStatuses].sort((a, b) => {
    // Active statuses first
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    
    // Then by priority (higher weight first)
    return b.status.statusWeight - a.status.statusWeight;
  });

  // If no statuses and user can't edit, don't show anything
  if (memberStatuses.length === 0 && !canEdit) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl mb-1 font-semibold barlow-font flex items-center gap-2">
          <Activity className="h-8 w-8" />
          Status Information
        </h1>
        {canEdit && (
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Status
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden border rounded-lg">
        {/* Mobile view */}
        <div className="lg:hidden divide-y">
          {sortedStatuses.map((memberStatus) => (
            <div key={memberStatus.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{memberStatus.status.statusName}</p>
                  <p className="text-sm text-gray-500">
                    {formatStatusWeight(memberStatus.status.statusWeight)}
                  </p>
                </div>
                <Badge className={getStatusColor(memberStatus.isActive)}>
                  {memberStatus.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {(memberStatus.contactName || memberStatus.contactInfo) && (
                <div className="space-y-1 text-sm mb-4">
                  {memberStatus.contactName && (
                    <p><span className="font-medium">Contact:</span> {memberStatus.contactName}</p>
                  )}
                  {memberStatus.contactType && memberStatus.contactInfo && (
                    <p><span className="font-medium">Info:</span> {memberStatus.contactType}: {memberStatus.contactInfo}</p>
                  )}
                </div>
              )}

              {canEdit && (
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(memberStatus)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(memberStatus)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop view */}
        <div className="hidden lg:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                {canEdit && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedStatuses.map((memberStatus) => (
                <tr key={memberStatus.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {memberStatus.status.statusName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {formatStatusWeight(memberStatus.status.statusWeight)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(memberStatus.isActive)}>
                      {memberStatus.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {memberStatus.contactName || memberStatus.contactInfo ? (
                      <div className="text-sm">
                        {memberStatus.contactName && (
                          <div className="font-medium">{memberStatus.contactName}</div>
                        )}
                        {memberStatus.contactType && memberStatus.contactInfo && (
                          <div className="text-gray-500">
                            {memberStatus.contactType}: {memberStatus.contactInfo}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No contact info</span>
                    )}
                  </td>
                  {canEdit && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(memberStatus)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(memberStatus)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {memberStatuses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No status information available.
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AddStatusDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        memberId={memberId}
        availableStatuses={availableStatuses}
        availableContacts={availableContacts}
        onStatusAdded={onStatusAdded}
        existingStatusIds={memberStatuses.map(status => status.status.id)}
      />

      <EditStatusDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        editingStatus={editingStatus}
        availableContacts={availableContacts}
        onStatusUpdated={onStatusUpdated}
      />

      <DeleteStatusDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        deletingStatus={deletingStatus}
        onStatusDeleted={onStatusDeleted}
      />
    </div>
  );
}