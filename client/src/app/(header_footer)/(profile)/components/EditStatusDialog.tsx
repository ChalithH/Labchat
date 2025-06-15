"use client";

import React, { useState, useEffect } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import { MemberStatus, ContactType } from '../types/profile.types';

interface EditStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingStatus: MemberStatus | null;
  availableContacts: ContactType[];
  onStatusUpdated: (updatedStatus: MemberStatus) => void;
}

export default function EditStatusDialog({
  open,
  onOpenChange,
  editingStatus,
  availableContacts,
  onStatusUpdated,
}: EditStatusDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<number | undefined>(undefined);
  const [localContacts, setLocalContacts] = useState<ContactType[]>(availableContacts);
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    if (editingStatus) {
      setSelectedContactId(editingStatus.contactId);
      setDescription(editingStatus.description || '');
    }
  }, [editingStatus]);

  // Get the display value for the select
  const getCurrentContactDisplayValue = () => {
    if (!editingStatus || !editingStatus.contactName) {
      return "No current contact";
    }
    return `${editingStatus.contactName} (${editingStatus.contactType}: ${editingStatus.contactInfo})`;
  };

  // Update local contacts when prop changes
  useEffect(() => {
    setLocalContacts(availableContacts);
  }, [availableContacts]);

  // Refresh contacts when dialog opens
  useEffect(() => {
    if (open && availableContacts.length > 0) {
      const userId = availableContacts[0]?.userId;
      if (userId) {
        api.get(`/profile/contacts/user/${userId}`)
          .then(response => setLocalContacts(response.data))
          .catch(() => {}); // Silently fail
      }
    }
  }, [open, availableContacts]);

  const handleSubmit = async () => {
    if (!editingStatus) return;

    if (!selectedContactId) {
      toast.error('Please select a contact for this status');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        contactId: selectedContactId,
        description: description.trim() || null,
      };

      await api.put(`/member/member-status/${editingStatus.id}`, payload);
      
      // Update the status object
      const selectedContact = localContacts.find(c => c.id === selectedContactId);
      const updatedStatus: MemberStatus = {
        ...editingStatus,
        contactType: selectedContact?.type,
        contactInfo: selectedContact?.info,
        contactName: selectedContact?.name,
        contactId: selectedContact?.id,
        description: description.trim() || undefined,
      };

      onStatusUpdated(updatedStatus);
      toast.success('Status updated successfully');
      onOpenChange(false);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      toast.error(err.response?.data?.error || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (editingStatus) {
      // Reset to original values when canceling
      setSelectedContactId(editingStatus.contactId);
      setDescription(editingStatus.description || '');
    }
    onOpenChange(false);
  };

  if (!editingStatus) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Status</DialogTitle>
          <DialogDescription>
            Update the contact information associated with this status.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Status</Label>
            <div className="px-3 py-2 border rounded-md bg-gray-50">
              <span className="font-medium">{editingStatus.status.statusName}</span>
              <span className="text-sm text-gray-500 ml-2">
                (Cannot be changed)
              </span>
            </div>
          </div>
          
          <div>
            <Label>Current Contact</Label>
            <div className="px-3 py-2 border rounded-md bg-gray-50">
              <span className="font-medium">{getCurrentContactDisplayValue()}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="contact-select">Change to Different Contact</Label>
            <Select 
              value={selectedContactId?.toString() || ""} 
              onValueChange={(value) => setSelectedContactId(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select different contact..." />
              </SelectTrigger>
              <SelectContent>
                {localContacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id!.toString()}>
                    {contact.name} ({contact.type}: {contact.info})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              Please select a contact to associate with this status. *Required
            </p>
          </div>
          
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a description for this status"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Provide additional context about your status to help your team know more details.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !selectedContactId}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}