"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { toast } from "sonner";
import api from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MemberStatus, ContactType } from '../types/profile.types';

interface Status {
  id: number;
  statusName: string;
  statusWeight: number;
}

interface AddStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: number;
  availableStatuses: Status[];
  availableContacts: ContactType[];
  onStatusAdded: (newStatus: MemberStatus) => void;
  existingStatusIds?: number[]; // Add this to track existing statuses
}

const formatStatusWeight = (weight: number) => {
  const weightLabels: { [key: number]: string } = {
    10: 'High Priority',
    5: 'Medium Priority',
    0: 'Low Priority'
  };
  return weightLabels[weight] || `Priority ${weight}`;
};

export default function AddStatusDialog({
  open,
  onOpenChange,
  memberId,
  availableStatuses,
  availableContacts,
  onStatusAdded,
  existingStatusIds = [],
}: AddStatusDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState<number>(0);
  const [selectedContactId, setSelectedContactId] = useState<number | undefined>(undefined);
  const [localContacts, setLocalContacts] = useState<ContactType[]>(availableContacts);

  // Filter out statuses that already exist for this member
  const filteredStatuses = availableStatuses.filter(
    status => !existingStatusIds.includes(status.id)
  );

  // Update local contacts when prop changes or dialog opens
  useEffect(() => {
    setLocalContacts(availableContacts);
  }, [availableContacts]);

  // Refresh contacts when dialog opens
  useEffect(() => {
    if (open && availableContacts.length > 0) {
      // Extract userId from the first contact or pass it as a prop
      const userId = availableContacts[0]?.userId;
      if (userId) {
        api.get(`/profile/contacts/user/${userId}`)
          .then(response => setLocalContacts(response.data))
          .catch(() => {}); // Silently fail
      }
    }
  }, [open, availableContacts]);

  const handleSubmit = async () => {
    if (!selectedStatusId) {
      toast.error('Please select a status');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        memberId: memberId,
        statusId: selectedStatusId,
        contactId: selectedContactId || null,
      };

      const response = await api.post('/member/member-status', payload);
      
      // Create the new status object for local state
      const selectedStatus = filteredStatuses.find(s => s.id === selectedStatusId);
      const selectedContact = localContacts.find(c => c.id === selectedContactId);
      
      if (selectedStatus) {
        const newMemberStatus: MemberStatus = {
          id: response.data.id,
          status: selectedStatus,
          isActive: false,
          contactType: selectedContact?.type,
          contactInfo: selectedContact?.info,
          contactName: selectedContact?.name,
          contactId: selectedContact?.id,
        };

        onStatusAdded(newMemberStatus);
        toast.success('Status added successfully');
        
        // Reset form
        setSelectedStatusId(0);
        setSelectedContactId(undefined);
        onOpenChange(false);
      }
    } catch (err: any) {
      console.error('Failed to add status:', err);
      toast.error(err.response?.data?.error || 'Failed to add status');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedStatusId(0);
    setSelectedContactId(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Status</DialogTitle>
          <DialogDescription>
            Add a new status for this member and optionally associate it with existing contact information.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="status-select">Status *</Label>
            <Select 
              value={selectedStatusId.toString()} 
              onValueChange={(value) => setSelectedStatusId(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0" disabled>Select a status...</SelectItem>
                {filteredStatuses.length > 0 ? (
                  filteredStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id.toString()}>
                      {status.statusName} ({formatStatusWeight(status.statusWeight)})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="0" disabled>All available statuses have been added</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="contact-select">Contact Information (Optional)</Label>
            <Select 
              value={selectedContactId?.toString() || "none"} 
              onValueChange={(value) => setSelectedContactId(value === "none" ? undefined : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select existing contact..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No contact</SelectItem>
                {localContacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id!.toString()}>
                    {contact.name} ({contact.type}: {contact.info})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              Select an existing contact to associate with this status, or leave empty for no contact.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !selectedStatusId || filteredStatuses.length === 0}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Add Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}