"use client";
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, Trash2, Plus, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import DeleteStatusDialog from '../../(profile)/components/DeleteStatusDialog';

interface Status {
  id: number;
  statusName: string;
  statusWeight: number;
}

interface StatusOption {
  id: number;
  status: Status;
  isActive: boolean;
  contactType?: string;
  contactInfo?: string;
  contactName?: string;
  description?: string;
}

interface Contact {
  id: number;
  type: string;
  info: string;
  name?: string;
  useCase?: string;
}

interface StatusManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: {
    memberID: number;
    status: StatusOption[];
    id?: number; // User ID
  };
  onStatusUpdate: () => Promise<void>;
  onCheckIn?: () => Promise<void>;
}

export default function StatusManagementModal({
  open,
  onOpenChange,
  member,
  onStatusUpdate,
  onCheckIn
}: StatusManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'create'>('current');
  const [editingStatus, setEditingStatus] = useState<number | null>(null);
  const [newStatusName, setNewStatusName] = useState('');
  const [newContactInfo, setNewContactInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [editContactInfo, setEditContactInfo] = useState('');
  const [availableStatuses, setAvailableStatuses] = useState<Status[]>([]);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingStatus, setDeletingStatus] = useState<StatusOption | null>(null);

  // Fetch available statuses and contacts when modal opens
  useEffect(() => {
    if (open) {
      // Fetch statuses
      api.get('/member/statuses')
        .then(res => {
          // Filter out statuses that the member already has
          const existingStatusIds = member.status.map(s => s.status.id);
          const filtered = res.data.filter((status: Status) => 
            !existingStatusIds.includes(status.id)
          );
          setAvailableStatuses(filtered);
        })
        .catch(err => {
          console.error('Failed to fetch statuses:', err);
          toast.error('Failed to load available statuses');
        });

      // Fetch contacts if we have a user ID
      if (member.id) {
        api.get(`/profile/contacts/user/${member.id}`)
          .then(res => {
            setAvailableContacts(res.data || []);
          })
          .catch(err => {
            console.error('Failed to fetch contacts:', err);
            // Don't show error toast here as user might not have any contacts
            setAvailableContacts([]);
          });
      }
    }
  }, [open, member.status, member.id]);

  const handleSetActive = async (statusId: number) => {
    setLoading(true);
    try {
      await api.post('/member/set-status', {
        memberId: member.memberID,
        statusId
      });
      await onStatusUpdate();
      toast.success('Status updated successfully');
      
      // If onCheckIn is provided, check in after setting status
      if (onCheckIn) {
        await onCheckIn();
        onOpenChange(false);
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
    setLoading(false);
  };

  const handleDeleteStatus = (statusId: number) => {
    // Find the member status to delete
    const memberStatus = member.status.find(s => s.status.id === statusId);
    if (!memberStatus) {
      console.error('Member status not found');
      return;
    }
    
    setDeletingStatus(memberStatus);
    setDeleteDialogOpen(true);
  };

  const onStatusDeleted = async (deletedStatusId: number) => {
    await onStatusUpdate();
    setDeletingStatus(null);
  };

  const handleCreateStatus = async () => {
    if (!selectedStatusId) {
      toast.error('Please select a status');
      return;
    }
    
    if (!selectedContactId) {
      toast.error('Please select a contact. If you have no contacts, please add one on your profile page.');
      return;
    }
    
    setLoading(true);
    try {
      // Find the member-status ID if it exists (shouldn't exist if we filtered correctly)
      const existingMemberStatus = member.status.find(s => s.status.id === selectedStatusId);
      if (existingMemberStatus) {
        toast.error('You already have this status');
        setLoading(false);
        return;
      }

      // Create the member-status association
      await api.post('/member/member-status', {
        memberId: member.memberID,
        statusId: selectedStatusId,
        contactId: selectedContactId,
        description: description.trim() || null
      });
      
      await onStatusUpdate();
      toast.success('Status added successfully');
      setSelectedStatusId(null);
      setSelectedContactId(null);
      setDescription('');
      setNewContactInfo('');
      setActiveTab('current');
    } catch (err: any) {
      console.error('Failed to add status:', err);
      toast.error(err.response?.data?.error || 'Failed to add status');
    }
    setLoading(false);
  };

  const getStatusBadgeColor = (statusName: string, isActive: boolean) => {
    if (!isActive) return 'bg-gray-100 text-gray-600';
    
    switch (statusName.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Your Status</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Switch between existing statuses or add new ones to your profile. Only one status can be active at a time.
          </p>
        </DialogHeader>

        <div className="mt-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex gap-4 border-b mb-4">
            <button
              onClick={() => setActiveTab('current')}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === 'current'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Current Statuses
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === 'create'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Add New Status
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {activeTab === 'current' ? (
              <div className="space-y-3 h-full">
                {member.status.map((statusOption) => (
                  <div
                    key={statusOption.status.id}
                    className={`p-4 rounded-lg border ${
                      statusOption.isActive ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{statusOption.status.statusName}</h4>
                          <Badge 
                            variant="secondary" 
                            className={getStatusBadgeColor(statusOption.status.statusName, statusOption.isActive)}
                          >
                            {statusOption.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </Badge>
                        </div>
                        
                        {statusOption.description ? (
                          <p className="text-sm text-muted-foreground">
                            {statusOption.description}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Default {statusOption.status.statusName.toLowerCase()} status
                          </p>
                        )}
                        
                        {statusOption.contactInfo && (
                          <p className="text-sm text-muted-foreground">
                            Contact: {statusOption.contactType || 'Primary Email'} ({statusOption.contactInfo})
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!statusOption.isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetActive(statusOption.status.id)}
                            disabled={loading}
                          >
                            Set Active
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteStatus(statusOption.status.id)}
                          disabled={loading || statusOption.isActive}
                          title={statusOption.isActive ? "Cannot delete active status" : "Delete status"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 h-full flex flex-col">
                <div>
                  <Label htmlFor="status-select">Select Status</Label>
                  <Select
                    value={selectedStatusId?.toString() || ''}
                    onValueChange={(value) => setSelectedStatusId(parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a status to add..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStatuses.length === 0 ? (
                        <SelectItem value="none" disabled>
                          All available statuses have been added
                        </SelectItem>
                      ) : (
                        availableStatuses.map((status) => (
                          <SelectItem key={status.id} value={status.id.toString()}>
                            {status.statusName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select from available statuses to add to your profile.
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="contact-select">Contact Information *</Label>
                  <Select
                    value={selectedContactId?.toString() || ''}
                    onValueChange={(value) => setSelectedContactId(parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a contact..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableContacts.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No contacts available
                        </SelectItem>
                      ) : (
                        availableContacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id.toString()}>
                            {contact.name || contact.type} ({contact.info})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {availableContacts.length === 0 ? (
                    <p className="text-sm text-yellow-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      You need to add contact information on your profile page before creating statuses.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                      Select the contact information to associate with this status.
                    </p>
                  )}
                </div>
                
                <div className="flex-1">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add a description for this status"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Provide additional context about your status to help your team know more details.
                  </p>
                </div>
                
                <div className="mt-auto">
                  <Button
                    onClick={handleCreateStatus}
                    disabled={!selectedStatusId || !selectedContactId || loading || availableStatuses.length === 0 || availableContacts.length === 0}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Status
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>

      <DeleteStatusDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        deletingStatus={deletingStatus}
        onStatusDeleted={onStatusDeleted}
      />
    </Dialog>
  );
}