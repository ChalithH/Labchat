"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, AlertCircle, UserCog, Users, Trash2, Key } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import api from '@/lib/api';
import { LabMemberData, LabRoleData, GlobalStatusType, UserContact, MemberStatusEntry } from '../types/LabTypes';

interface ManageMembersTabProps {
  labMembers: LabMemberData[];
  availableLabRoles: LabRoleData[];
  isLoadingMembers: boolean;
  membersError: string | null;
  onMembersUpdate: () => void;
  isRootAdmin: boolean;
  labId: string;
}

export default function ManageMembersTab({ 
  labMembers, 
  availableLabRoles, 
  isLoadingMembers, 
  membersError, 
  onMembersUpdate,
  isRootAdmin,
  labId
}: ManageMembersTabProps) {
  // State for member management
  const [globalStatuses, setGlobalStatuses] = useState<GlobalStatusType[]>([]);
  const [selectedMemberContacts, setSelectedMemberContacts] = useState<UserContact[] | null>(null);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // State for manage status modal
  const [memberForStatusModal, setMemberForStatusModal] = useState<LabMemberData | null>(null);
  const [isManageStatusModalOpen, setIsManageStatusModalOpen] = useState(false);

  // State for editing status description
  const [editingMemberStatusId, setEditingMemberStatusId] = useState<number | null>(null);
  const [currentEditingDescription, setCurrentEditingDescription] = useState<string>("");
  const [isSavingDescription, setIsSavingDescription] = useState(false);

  // State for delete confirmation
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [statusToDeleteId, setStatusToDeleteId] = useState<number | null>(null);
  const [isDeletingStatus, setIsDeletingStatus] = useState(false);

  // State for creating new status
  const [newStatusSelectedGlobalStatusId, setNewStatusSelectedGlobalStatusId] = useState<string>(""); 
  const [newStatusSelectedContactId, setNewStatusSelectedContactId] = useState<string>(""); 
  const [newStatusDescription, setNewStatusDescription] = useState<string>("");
  const [isCreatingNewStatus, setIsCreatingNewStatus] = useState(false);

  // State for change role modal
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [memberForRoleChange, setMemberForRoleChange] = useState<LabMemberData | null>(null);
  const [selectedNewLabRoleId, setSelectedNewLabRoleId] = useState<string>(""); 
  const [isSavingRole, setIsSavingRole] = useState(false);

  // State for remove member
  const [isRemoveMemberConfirmOpen, setIsRemoveMemberConfirmOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<LabMemberData | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  // State for updating statuses
  const [isUpdatingPCIForMemberId, setIsUpdatingPCIForMemberId] = useState<number | null>(null);
  const [isUpdatingInductionForMemberId, setIsUpdatingInductionForMemberId] = useState<number | null>(null);

  // State for password reset
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);
  const [memberForPasswordReset, setMemberForPasswordReset] = useState<LabMemberData | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleOpenManageStatusesModal = useCallback(async (member: LabMemberData) => {
    setMemberForStatusModal(member);
    setSelectedMemberContacts(null);
    setIsLoadingContacts(true);
    setIsManageStatusModalOpen(true);
    try {
      const response = await api.get(`/user/${member.id}/contacts`); 
      setSelectedMemberContacts(response.data);
      
      // Fetch global statuses if not already loaded
      if (globalStatuses.length === 0) {
        const statusResponse = await api.get('/member/statuses');
        setGlobalStatuses(statusResponse.data);
      }
    } catch (err: any) {
      console.error(`Failed to fetch contacts for user ID: ${member.id}`, err);
      toast.error(`Failed to fetch contacts for ${member.displayName}.`);
    } finally {
      setIsLoadingContacts(false);
    }
  }, [globalStatuses.length]);

  const handleSetActiveStatus = async (memberStatusIdToActivate: number) => {
    if (!memberForStatusModal) return;

    try {
      await api.put(`/admin/member-status/${memberStatusIdToActivate}/activate`);
      toast.success("Status activated successfully");
      
      // Update status activation in modal data - 'selective' update
      const updatedStatuses = memberForStatusModal.status.map(statusEntry => ({
        ...statusEntry,
        isActive: statusEntry.id === memberStatusIdToActivate
      }));
      
      setMemberForStatusModal({
        ...memberForStatusModal,
        status: updatedStatuses
      });
    } catch (err: any) {
      console.error(`Failed to activate MemberStatus ID: ${memberStatusIdToActivate}`, err);
      toast.error(err.response?.data?.error || "Failed to activate status.");
    }
  };

  const handleStartEditDescription = (memberStatus: MemberStatusEntry) => {
    setEditingMemberStatusId(memberStatus.id);
    setCurrentEditingDescription(memberStatus.description || "");
  };

  const handleCancelEditDescription = () => {
    setEditingMemberStatusId(null);
    setCurrentEditingDescription("");
  };

  const handleSaveDescription = async () => {
    if (editingMemberStatusId === null || !memberForStatusModal) return;
    setIsSavingDescription(true);
    try {
      await api.put(`/admin/member-status/${editingMemberStatusId}`, { description: currentEditingDescription });
      toast.success("Description updated!");
      setEditingMemberStatusId(null);
      setCurrentEditingDescription("");
      
      const updatedStatuses = memberForStatusModal.status.map(statusEntry => 
        statusEntry.id === editingMemberStatusId
          ? { ...statusEntry, description: currentEditingDescription }
          : statusEntry
      );
      
      setMemberForStatusModal({
        ...memberForStatusModal,
        status: updatedStatuses
      });
    } catch (err: any) {
      console.error("Failed to update description", err);
      toast.error(err.response?.data?.error || "Failed to save description.");
    } finally {
      setIsSavingDescription(false);
    }
  };

  const handleOpenConfirmDeleteDialog = (memberStatusId: number) => {
    setStatusToDeleteId(memberStatusId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDeleteStatus = async () => {
    if (statusToDeleteId === null || !memberForStatusModal) return;
    setIsDeletingStatus(true);
    try {
      await api.delete(`/admin/member-status/${statusToDeleteId}`);
      toast.success("Status entry deleted!");
      setIsConfirmDeleteDialogOpen(false);
      setStatusToDeleteId(null);
      
      // Remove deleted status from modal data - selective update
      const updatedStatuses = memberForStatusModal.status.filter(
        statusEntry => statusEntry.id !== statusToDeleteId
      );
      
      setMemberForStatusModal({
        ...memberForStatusModal,
        status: updatedStatuses
      });
    } catch (err: any) {
      console.error("Failed to delete status entry", err);
      toast.error(err.response?.data?.error || "Failed to delete status entry.");
    } finally {
      setIsDeletingStatus(false);
    }
  };

  const handleSaveNewStatus = async () => {
    if (!memberForStatusModal || !newStatusSelectedGlobalStatusId || !newStatusSelectedContactId) {
      toast.error("Please select a global status, a contact, and provide a description.");
      return;
    }
    setIsCreatingNewStatus(true);
    try {
      const payload = {
        statusId: parseInt(newStatusSelectedGlobalStatusId),
        contactId: parseInt(newStatusSelectedContactId),
        description: newStatusDescription,
      };
      
      const response = await api.post(`/admin/lab-member/${memberForStatusModal.memberID}/status`, payload);
      const newStatusEntry = response.data;
      
      toast.success("New status entry created successfully!");

      // Clear form fields
      setNewStatusSelectedGlobalStatusId("");
      setNewStatusSelectedContactId("");
      setNewStatusDescription("");

      // Add new status to modal data - selective update
      const updatedStatuses = [...memberForStatusModal.status, newStatusEntry];
      
      setMemberForStatusModal({
        ...memberForStatusModal,
        status: updatedStatuses
      });
    } catch (err: any) {
      console.error("Failed to create new status entry", err);
      toast.error(err.response?.data?.error || "Failed to create new status entry.");
    } finally {
      setIsCreatingNewStatus(false);
    }
  };

  const handleOpenChangeRoleModal = (member: LabMemberData) => {
    setMemberForRoleChange(member);
    setSelectedNewLabRoleId(member.labRoleId?.toString() || "");
    setIsChangeRoleModalOpen(true);
  };

  const handleSaveLabRole = async () => {
    if (!memberForRoleChange || !selectedNewLabRoleId) {
      toast.error("Please select a new role.");
      return;
    }
    setIsSavingRole(true);
    try {
      await api.put(`/admin/lab-member/${memberForRoleChange.memberID}/role`, { 
        newLabRoleId: parseInt(selectedNewLabRoleId)
      });
      
      toast.success("Lab role updated successfully!");
      setIsChangeRoleModalOpen(false); 
      setMemberForRoleChange(null);
      setSelectedNewLabRoleId("");
      onMembersUpdate();
    } catch (err: any) {
      console.error("Failed to update lab role:", err);
      toast.error(err.response?.data?.error || "Failed to update lab role.");
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleToggleInduction = async (member: LabMemberData) => {
    if (!member || typeof member.memberID === 'undefined') {
      console.error("Invalid member data provided.");
      toast.error("Could not update induction status due to invalid member data.");
      return;
    }
    setIsUpdatingInductionForMemberId(member.memberID);
    try {
      await api.put(`/admin/lab-member/${member.memberID}/induction`);
      toast.success(`${member.displayName}'s induction status toggled!`);
      onMembersUpdate();
    } catch (err: any) {
      console.error(`Failed to toggle induction for ${member.displayName}:`, err);
      toast.error(err.response?.data?.error || "Failed to toggle induction status.");
    } finally {
      setIsUpdatingInductionForMemberId(null);
    }
  };

  const handleOpenRemoveMemberConfirm = (member: LabMemberData) => {
    setMemberToRemove(member);
    setIsRemoveMemberConfirmOpen(true);
  };

  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove) {
      toast.error("Error: Member details missing for removal.");
      return;
    }
    setIsRemovingMember(true);
    try {
      await api.delete('/admin/remove-user', { 
        data: { 
          labId: parseInt(labId), 
          userId: memberToRemove.id
        } 
      });
      
      toast.success(`${memberToRemove.displayName} has been removed from the lab.`);
      setIsRemoveMemberConfirmOpen(false);
      setMemberToRemove(null);
      onMembersUpdate();
    } catch (err: any) {
      console.error(`Failed to remove ${memberToRemove.displayName}:`, err);
      toast.error(err.response?.data?.error || "Failed to remove member.");
    } finally {
      setIsRemovingMember(false);
    }
  };

  const handleTogglePCIMember = async (memberToUpdate: LabMemberData) => {
    if (isUpdatingPCIForMemberId) return;
    setIsUpdatingPCIForMemberId(memberToUpdate.memberID);
    try {
      await api.put(`/admin/lab-member/${memberToUpdate.memberID}/pci`, {
        isPCI: !memberToUpdate.isPCI
      });
      
      toast.success(`PIC ${!memberToUpdate.isPCI ? 'assigned to' : 'removed from'} ${memberToUpdate.displayName}`);
      onMembersUpdate();
    } catch (err: any) {
      console.error("Failed to toggle PIC for member:", err);
      toast.error(err.response?.data?.error || 'Failed to update PIC status');
    } finally {
      setIsUpdatingPCIForMemberId(null);
    }
  };

  const handleOpenPasswordResetModal = (member: LabMemberData) => {
    setMemberForPasswordReset(member);
    setNewPassword('');
    setConfirmPassword('');
    setIsPasswordResetModalOpen(true);
  };

  const handleClosePasswordResetModal = () => {
    setIsPasswordResetModalOpen(false);
    setMemberForPasswordReset(null);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handlePasswordReset = async () => {
    if (!memberForPasswordReset || newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 1) {
      toast.error("Password must be at least 1 character");
      return;
    }

    setIsResettingPassword(true);
    try {
      await api.put(`/admin/lab/${labId}/reset-member-password`, {
        userId: memberForPasswordReset.id,
        newPassword: newPassword
      });
      
      toast.success(`Password reset successfully for ${memberForPasswordReset.displayName}`);
      handleClosePasswordResetModal();
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Manage Members</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingMembers && (
            <div className="flex justify-center items-center min-h-[150px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading members...</p>
            </div>
          )}
          {membersError && (
            <div className="flex flex-col items-center justify-center min-h-[150px] text-destructive">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p className="text-center">{membersError}</p>
              <Button variant="outline" className="mt-4" onClick={onMembersUpdate}>Retry</Button>
            </div>
          )}
          {!isLoadingMembers && !membersError && labMembers.length === 0 && (
            <p className="text-center text-gray-500 py-8">No members found in this lab.</p>
          )}
          {!isLoadingMembers && !membersError && labMembers.length > 0 && (
            <div className="space-y-4">
              {labMembers.map((member) => (
                <div key={member.memberID} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="mb-2 sm:mb-0">
                    <p className="text-lg font-semibold">{member.displayName || 'N/A'}</p>
                    <p className="text-sm text-gray-600">
                      Role: {availableLabRoles.find(role => role.id === member.labRoleId)?.name  || 'N/A'}
                      {member.labRoleId && availableLabRoles.length > 0 && (
                        <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                          Permission Level: {availableLabRoles.find(role => role.id === member.labRoleId)?.permissionLevel || '?'}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      Induction: {member.inductionDone ? 
                        <span className="text-green-600 font-medium">Completed</span> : 
                        <span className="text-orange-600 font-medium">Pending</span>
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      PIC Status: {member.isPCI ? 
                        <span className="text-blue-600 font-medium">Active</span> : 
                        <span className="text-gray-600 font-medium">Not Assigned</span>
                      }
                    </p>
                  </div>
                  <div className="flex space-x-2 flex-wrap items-center">
                    <div className="flex items-center space-x-1 p-1.5 rounded-md hover:bg-gray-100">
                        <Switch
                            id={`pci-toggle-${member.memberID}`}
                            checked={member.isPCI}
                            onCheckedChange={() => handleTogglePCIMember(member)}
                            disabled={isUpdatingPCIForMemberId === member.memberID}
                            aria-label={`Toggle PIC Status for ${member.displayName}`}
                        />
                        <Label htmlFor={`pci-toggle-${member.memberID}`} className="text-sm cursor-pointer select-none">
                            PIC Status
                        </Label>
                        {isUpdatingPCIForMemberId === member.memberID && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
                    </div>
                    <div className="flex items-center space-x-1 p-1.5 rounded-md hover:bg-gray-100">
                        <Switch
                            id={`induction-toggle-${member.memberID}`}
                            checked={member.inductionDone}
                            onCheckedChange={() => handleToggleInduction(member)}
                            disabled={isUpdatingInductionForMemberId === member.memberID}
                            aria-label={`Toggle Induction Status for ${member.displayName}`}
                        />
                        <Label htmlFor={`induction-toggle-${member.memberID}`} className="text-sm cursor-pointer select-none">
                            Inducted
                        </Label>
                        {isUpdatingInductionForMemberId === member.memberID && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleOpenManageStatusesModal(member)} className="flex items-center">
                      <UserCog className="mr-1 h-4 w-4" /> Statuses
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenChangeRoleModal(member)} className="flex items-center">
                      <Users className="mr-1 h-4 w-4" /> Role
                    </Button>
                    {/* Only show Reset Password button if current user is admin OR target member is not admin */}
                    {(isRootAdmin || !member.isUserAdmin) && (
                      <Button variant="outline" size="sm" onClick={() => handleOpenPasswordResetModal(member)} className="flex items-center">
                        <Key className="mr-1 h-4 w-4" /> Reset Password
                      </Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => handleOpenRemoveMemberConfirm(member)} className="flex items-center">
                      <Trash2 className="mr-1 h-4 w-4" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manage Member Statuses Modal */}
      {memberForStatusModal && (
        <Dialog open={isManageStatusModalOpen} onOpenChange={setIsManageStatusModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Manage Statuses for {memberForStatusModal.displayName}</DialogTitle>
              <DialogDescription>
                View, edit, or create new status entries for this lab member.
                Only one status can be active at a time.
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh] p-4">
              <div className="space-y-6">
                {/* Section for Existing MemberStatus entries */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Current Status Entries</h3>
                  {memberForStatusModal.status && memberForStatusModal.status.length > 0 ? (
                    <div className="space-y-3">
                      {memberForStatusModal.status.map((ms) => (
                        <Card key={ms.id} className={`p-3 ${ms.isActive ? 'border-green-500' : ''}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-base">{ms.status.statusName}</p>
                              {editingMemberStatusId === ms.id ? (
                                <div className="mt-1 space-y-2">
                                  <Input 
                                    value={currentEditingDescription}
                                    onChange={(e) => setCurrentEditingDescription(e.target.value)}
                                    placeholder="Enter description"
                                    className="text-sm"
                                    disabled={isSavingDescription}
                                  />
                                   <div className="flex space-x-2">
                                    <Button size="sm" onClick={handleSaveDescription} disabled={isSavingDescription}>
                                      {isSavingDescription ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Save
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={handleCancelEditDescription} disabled={isSavingDescription}>Cancel</Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-600">{ms.description || "No description"}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Contact: {ms.contact.name} ({ms.contact.type} - {ms.contact.info})
                              </p>
                            </div>
                            <div className="text-right">
                               <p className={`text-xs font-semibold p-1 rounded ${ms.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {ms.isActive ? "ACTIVE" : "INACTIVE"}
                              </p>
                              {editingMemberStatusId !== ms.id && (
                                <div className="mt-2 flex items-center space-x-1">
                                  <Button variant="outline" size="sm" onClick={() => handleStartEditDescription(ms)}>Edit</Button>
                                  {!ms.isActive && <Button variant="ghost" size="sm" onClick={() => handleSetActiveStatus(ms.id)}>Set Active</Button>}
                                  <Button variant="destructive" size="sm" onClick={() => handleOpenConfirmDeleteDialog(ms.id)} className="p-1.5 h-auto">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No status entries found for this member.</p>
                  )}
                </div>

                {/* Section for Creating New MemberStatus */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 pt-4 border-t">Create New Status Entry</h3>
                  {isLoadingContacts && <div className="flex items-center text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading contacts...</div>}
                  {!isLoadingContacts && selectedMemberContacts && memberForStatusModal && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="globalStatusSelect">Global Status Type</Label>
                        <Select 
                          value={newStatusSelectedGlobalStatusId}
                          onValueChange={setNewStatusSelectedGlobalStatusId}
                          disabled={isCreatingNewStatus}
                        >
                          <SelectTrigger id="globalStatusSelect">
                            <SelectValue placeholder="Select a global status type" />
                          </SelectTrigger>
                          <SelectContent>
                            {globalStatuses.map(gs => (
                              <SelectItem key={gs.id} value={String(gs.id)}>{gs.statusName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="contactSelect">Member Contact</Label>
                        {selectedMemberContacts.length > 0 ? (
                          <Select 
                            value={newStatusSelectedContactId}
                            onValueChange={setNewStatusSelectedContactId}
                            disabled={isCreatingNewStatus || selectedMemberContacts.length === 0}
                          >
                            <SelectTrigger id="contactSelect">
                              <SelectValue placeholder="Select a contact method" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedMemberContacts.map(contact => (
                                <SelectItem key={contact.id} value={String(contact.id)}>
                                  {contact.name} ({contact.type}: {contact.info})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : <p className="text-sm text-gray-500 pt-1">No contacts found for this user to link.</p>}
                      </div>
                      <div>
                        <Label htmlFor="newStatusDescription">Description</Label>
                        <Input 
                          id="newStatusDescription"
                          value={newStatusDescription}
                          onChange={(e) => setNewStatusDescription(e.target.value)}
                          placeholder="Enter description for this status (optional)"
                          disabled={isCreatingNewStatus}
                        />
                      </div>
                      <Button onClick={handleSaveNewStatus} disabled={isCreatingNewStatus || !newStatusSelectedGlobalStatusId || !newStatusSelectedContactId || selectedMemberContacts.length === 0}>
                        {isCreatingNewStatus ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save New Status
                      </Button>
                    </div>
                  )}
                   {!isLoadingContacts && !selectedMemberContacts && (
                     <p className="text-sm text-gray-500">Could not load contacts for creating a new status.</p>
                   )}
                </div>
              </div>
            </ScrollArea>
            
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm Delete Status Dialog */}
      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the status entry.
              If this is the member&apos;s active status, they may not have an active status afterwards unless another is set.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingStatus}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteStatus} disabled={isDeletingStatus} className="bg-destructive hover:bg-destructive/90">
              {isDeletingStatus ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Lab Role Modal */}
      {memberForRoleChange && (
        <Dialog open={isChangeRoleModalOpen} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setMemberForRoleChange(null);
            setSelectedNewLabRoleId("");
          }
          setIsChangeRoleModalOpen(isOpen);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Change Role for {memberForRoleChange.displayName}</DialogTitle>
              <DialogDescription>
                Current Role: {memberForRoleChange.labRoleName || "N/A"}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <Label htmlFor="labRoleSelect">New Lab Role</Label>
              <Select 
                value={selectedNewLabRoleId}
                onValueChange={setSelectedNewLabRoleId}
                disabled={isSavingRole || availableLabRoles.length === 0}
              >
                <SelectTrigger id="labRoleSelect">
                  <SelectValue placeholder="Select a new lab role" />
                </SelectTrigger>
                <SelectContent>
                  {availableLabRoles
                    .filter(role => role.name.toLowerCase() !== 'former member')
                    .map(role => (
                      <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableLabRoles.filter(role => role.name.toLowerCase() !== 'former member').length === 0 && 
                <p className="text-xs text-red-500">No lab roles available to select.</p>
              }
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isSavingRole}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveLabRole} disabled={isSavingRole || !selectedNewLabRoleId || selectedNewLabRoleId === memberForRoleChange.labRoleId?.toString()}>
                {isSavingRole ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm Remove Member Dialog */}
      {memberToRemove && (
        <AlertDialog open={isRemoveMemberConfirmOpen} onOpenChange={(isOpen) => {
          if (!isOpen) setMemberToRemove(null);
          setIsRemoveMemberConfirmOpen(isOpen);
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove {memberToRemove.displayName}?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {memberToRemove.displayName} from this lab?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isRemovingMember}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmRemoveMember} 
                disabled={isRemovingMember}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isRemovingMember ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Remove Member
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Password Reset Modal */}
      {memberForPasswordReset && (
        <Dialog open={isPasswordResetModalOpen} onOpenChange={setIsPasswordResetModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reset Password for {memberForPasswordReset.displayName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 1 character)"
                  disabled={isResettingPassword}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  disabled={isResettingPassword}
                />
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                <p className="font-medium">Note:</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Share this temporary password with the member</li>
                  <li>• The member should change this password after logging in</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={handleClosePasswordResetModal}
                disabled={isResettingPassword}
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePasswordReset}
                disabled={
                  isResettingPassword || 
                  !newPassword || 
                  !confirmPassword || 
                  newPassword !== confirmPassword ||
                  newPassword.length < 1
                }
              >
                {isResettingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Reset Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}