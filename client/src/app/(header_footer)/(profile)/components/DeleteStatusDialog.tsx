"use client";

import React, { useState } from 'react';
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
import { MemberStatus } from '../types/profile.types';

interface DeleteStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deletingStatus: MemberStatus | null;
  onStatusDeleted: (deletedStatusId: number) => void;
}

export default function DeleteStatusDialog({
  open,
  onOpenChange,
  deletingStatus,
  onStatusDeleted,
}: DeleteStatusDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!deletingStatus) return;

    setLoading(true);
    try {
      await api.delete(`/member/member-status/${deletingStatus.id}`);
      
      onStatusDeleted(deletingStatus.id);
      toast.success('Status deleted successfully');
      onOpenChange(false);
    } catch (err: any) {
      console.error('Failed to delete status:', err);
      toast.error(err.response?.data?.error || 'Failed to delete status');
    } finally {
      setLoading(false);
    }
  };

  if (!deletingStatus) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Status</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this status? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="p-4 bg-red-50 rounded-md border border-red-200">
            <p className="text-sm font-medium text-red-900">
              Status: {deletingStatus.status.statusName}
            </p>
            {deletingStatus.contactName && (
              <p className="text-sm text-red-800 mt-1">
                Contact: {deletingStatus.contactName}
                {deletingStatus.contactType && deletingStatus.contactInfo && (
                  <span> ({deletingStatus.contactType}: {deletingStatus.contactInfo})</span>
                )}
              </p>
            )}
            {deletingStatus.isActive && (
              <p className="text-sm text-red-800 mt-2 font-medium">
                ⚠️ This is currently the active status for this member.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Delete Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}