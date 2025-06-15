"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import api from '@/lib/api';
import { toast } from "sonner";
import { LabDetails } from '../types/LabTypes';

interface LabDetailsTabProps {
  labDetails: LabDetails | null;
  onUpdate: () => void;
  isRootAdmin: boolean;
  labId: string;
}

export default function LabDetailsTab({ labDetails, onUpdate, isRootAdmin, labId }: LabDetailsTabProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isRemoveLabConfirmOpen, setIsRemoveLabConfirmOpen] = useState(false);
  const [isDeletingLab, setIsDeletingLab] = useState(false);

  // Editable fields
  const [editableName, setEditableName] = useState('');
  const [editableLocation, setEditableLocation] = useState('');
  const [editableStatus, setEditableStatus] = useState('');

  useEffect(() => {
    if (labDetails) {
      setEditableName(labDetails.name);
      setEditableLocation(labDetails.location);
      setEditableStatus(labDetails.status);
    }
  }, [labDetails]);

  useEffect(() => {
    if (labDetails) {
      const changed =
        editableName !== labDetails.name ||
        editableLocation !== labDetails.location ||
        editableStatus !== labDetails.status;
      setHasUnsavedChanges(changed);
    }
  }, [editableName, editableLocation, editableStatus, labDetails]);

  const handleUpdateLabDetails = async () => {
    if (!labDetails || !hasUnsavedChanges) return;

    setIsUpdating(true);
    try {
      const payload = {
        name: editableName,
        location: editableLocation,
        status: editableStatus,
      };
      await api.put(`/admin/lab/${labDetails.id}`, payload);
      toast.success('Lab details updated successfully!');
      onUpdate();
    } catch (err: any) {
      console.error("Error updating lab details:", err);
      toast.error(err.response?.data?.error || err.message || "Failed to update lab details.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteLab = async () => {
    if (!labDetails) return;
    
    setIsDeletingLab(true);
    try {
      await api.delete(`/admin/lab/${labId}`);
      toast.success(`Lab "${labDetails.name}" has been permanently deleted`);
      window.location.href = '/admin/dashboard';
    } catch (error: any) {
      console.error('Failed to delete lab:', error);
      toast.error(error.response?.data?.error || 'Failed to delete lab');
    } finally {
      setIsDeletingLab(false);
      setIsRemoveLabConfirmOpen(false);
    }
  };

  if (!labDetails) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Lab Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="labName">Lab Name</Label>
            <Input 
              id="labName" 
              value={editableName} 
              onChange={(e) => setEditableName(e.target.value)} 
              disabled={isUpdating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="labLocation">Location</Label>
            <Input 
              id="labLocation" 
              value={editableLocation} 
              onChange={(e) => setEditableLocation(e.target.value)} 
              disabled={isUpdating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="labStatus">Status</Label>
            <Select 
              value={editableStatus} 
              onValueChange={(value) => setEditableStatus(value)}
              disabled={isUpdating}
            >
              <SelectTrigger id="labStatus">
                <SelectValue placeholder="Select status">
                  {editableStatus || undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Operational">Operational</SelectItem>
                <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 flex justify-between items-center">
          <Button onClick={handleUpdateLabDetails} disabled={!hasUnsavedChanges || isUpdating}>
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
          
          {/* Delete Lab Button - Only visible to Root Admins */}
          {isRootAdmin && (
            <div className="flex items-center gap-2">
              <div className="h-6 w-px bg-gray-300"></div>
              <Button 
                variant="destructive" 
                onClick={() => setIsRemoveLabConfirmOpen(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Lab
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Remove Lab Confirmation Dialog */}
      <AlertDialog open={isRemoveLabConfirmOpen} onOpenChange={setIsRemoveLabConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lab Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this lab and all associated data?
              This will remove all members, inventory, discussions, events, and attendance records.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingLab}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteLab} 
              disabled={isDeletingLab}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeletingLab ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Delete Lab
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}