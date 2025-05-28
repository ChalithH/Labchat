"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, UserCog, Users, Trash2, Edit3 } from 'lucide-react';
import api from '@/lib/api'; 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface LabDetails {
  id: number;
  name: string;
  location: string;
  status: string;
  
}

// Define types for member management
interface UserData {
  id: number;
  firstName?: string;
  lastName?: string;
  displayName: string;
  jobTitle?: string;
  office?: string | null;
  bio?: string | null;
}

interface LabRoleData {
  id: number;
  name: string;
  // Add others if needed
}


interface ContactInMemberStatus {
  id: number;
  type: string;
  info: string;
  useCase?: string | null;
  name: string;
}

interface GlobalStatusInMemberStatus {
  id: number;
  statusName: string;
  statusWeight: number;
}

interface MemberStatusEntry {
  id: number; 
  contactId: number;
  
  statusId: number;
  isActive: boolean;
  description: string | null;
  contact: ContactInMemberStatus; 
  status: GlobalStatusInMemberStatus;
}

interface LabMemberData extends UserData {
  memberID: number;
  labID: number;
  createdAt: string;
  inductionDone: boolean;
  status: MemberStatusEntry[];
  labRoleName?: string;
  labRoleId?: number;
}

interface GlobalStatusType {
  id: number; 
  statusName: string;
}

interface UserContact {
  id: number;
  type: string;
  info: string;
  useCase?: string | null;
  name: string;
}

interface ManageLabClientProps {
  params: { id: string };
 
}

export default function ManageLabClient({ params }: ManageLabClientProps) {
  const [labDetails, setLabDetails] = useState<LabDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Editable fields
  const [editableName, setEditableName] = useState('');
  const [editableLocation, setEditableLocation] = useState('');
  const [editableStatus, setEditableStatus] = useState('');

  // State for Lab Members tab
  const [labMembers, setLabMembers] = useState<LabMemberData[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [availableLabRoles, setAvailableLabRoles] = useState<LabRoleData[]>([]);
  const [globalStatuses, setGlobalStatuses] = useState<GlobalStatusType[]>([]); 
  // Add states for modals later, selectedMember, isChangeRoleModalOpen, etc

  // State for managing individual member's contacts for status updates
  const [selectedMemberContacts, setSelectedMemberContacts] = useState<UserContact[] | null>(null);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // Store raw members data before enriching with role names
  const [rawLabMembers, setRawLabMembers] = useState<LabMemberData[]>([]);

  // Add state for selected member to manage statuses
  const [memberForStatusModal, setMemberForStatusModal] = useState<LabMemberData | null>(null);
  const [isManageStatusModalOpen, setIsManageStatusModalOpen] = useState(false);

  // State for editing a specific MemberStatus description
  const [editingMemberStatusId, setEditingMemberStatusId] = useState<number | null>(null);
  const [currentEditingDescription, setCurrentEditingDescription] = useState<string>("");
  const [isSavingDescription, setIsSavingDescription] = useState(false);

  // State for delete confirmation
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [statusToDeleteId, setStatusToDeleteId] = useState<number | null>(null);
  const [isDeletingStatus, setIsDeletingStatus] = useState(false);

  // State for creating new MemberStatus
  const [newStatusSelectedGlobalStatusId, setNewStatusSelectedGlobalStatusId] = useState<string>(""); 
  const [newStatusSelectedContactId, setNewStatusSelectedContactId] = useState<string>(""); 
  const [newStatusDescription, setNewStatusDescription] = useState<string>("");
  const [isCreatingNewStatus, setIsCreatingNewStatus] = useState(false);

  // State for Change Lab Role Modal
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [memberForRoleChange, setMemberForRoleChange] = useState<LabMemberData | null>(null);
  const [selectedNewLabRoleId, setSelectedNewLabRoleId] = useState<string>(""); 
  const [isSavingRole, setIsSavingRole] = useState(false);

  // State for Remove Member confirmation
  const [isRemoveMemberConfirmOpen, setIsRemoveMemberConfirmOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<LabMemberData | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  const fetchLabDetails = useCallback(async () => {
    if (!params.id) {
      console.log("fetchLabDetails: params.id is missing, bailing out.");
      setLoading(false); // Ensure loading is stopped if params.id is missing
      return;
    }
    console.log(`fetchLabDetails: Starting for lab ID: ${params.id}`);
    setLoading(true);
    setError(null);
    try {
      console.log(`fetchLabDetails: Making API call to /admin/get-lab/${params.id}`);
      const response = await api.get(`/admin/get-lab/${params.id}`);
      console.log("fetchLabDetails: API call successful, response data:", response.data);
      setLabDetails(response.data);
      setEditableName(response.data.name);
      setEditableLocation(response.data.location);
      setEditableStatus(response.data.status);
    } catch (err: any) {
      console.error("fetchLabDetails: API call failed:", err);
      setError(err.response?.data?.error || err.message || "Failed to fetch lab details.");
    } finally {
      console.log("fetchLabDetails: Finished, setting loading to false.");
      setLoading(false);
    }
  }, [params.id, setLoading, setError, setLabDetails, setEditableName, setEditableLocation, setEditableStatus]);

  const fetchLabMembers = useCallback(async () => {
    if (!params.id) return;
    setIsLoadingMembers(true);
    setMembersError(null);
    try {
      console.log(`fetchLabMembers: Fetching members for lab ID: ${params.id}`);
      const response = await api.get(`/lab/getMembers/${params.id}`);
      const rawMembersDataFromApi = response.data;

      
      const initialMappedMembers: LabMemberData[] = rawMembersDataFromApi.map((member: any) => ({
        id: member.id, 
        firstName: member.firstName,
        lastName: member.lastName,
        displayName: member.displayName,
        jobTitle: member.jobTitle,
        office: member.office,
        bio: member.bio,
        memberID: member.memberID, 
        labID: member.labID, 
        labRoleId: member.labRoleId, 
        createdAt: member.createdAt,
        inductionDone: member.inductionDone,
        status: member.status, 
      }));

      setRawLabMembers(initialMappedMembers); // Store for processing
      
    } catch (err: any) {
      console.error("fetchLabMembers: API call failed:", err);
      setMembersError(err.response?.data?.error || err.message || "Failed to fetch lab members.");
    } finally {
      setIsLoadingMembers(false);
    }
  }, [params.id]);

  const fetchLabRoles = useCallback(async () => {
    try {
      console.log("fetchLabRoles: Fetching available lab roles");
      const response = await api.get('/admin/get-lab-roles');
      setAvailableLabRoles(response.data);
      console.log("fetchLabRoles: API call successful, data:", response.data);
    } catch (err: any) {
      console.error("fetchLabRoles: API call failed:", err);
      // set an error state if this fetch is critical (later)
    }
  }, []);

  const fetchGlobalStatuses = useCallback(async () => {
    try {
      console.log("fetchGlobalStatuses: Fetching global status types");
      
      const response = await api.get('/member/statuses');
      setGlobalStatuses(response.data);
      console.log("fetchGlobalStatuses: API call successful, data:", response.data);
    } catch (err: any) {
      console.error("fetchGlobalStatuses: API call failed:", err);
    }
  }, []);

  useEffect(() => {
    // Initial data fetching when component mounts or lab ID (params.id) changes
    if (params.id) {
        fetchLabDetails();
        fetchLabMembers();
        fetchLabRoles();
        fetchGlobalStatuses();
    }
  }, [params.id, fetchLabDetails, fetchLabMembers, fetchLabRoles, fetchGlobalStatuses]);

  useEffect(() => {
    let newLabMembersData: LabMemberData[];

    if (rawLabMembers.length > 0 && availableLabRoles.length > 0) {
      const roleMap = new Map(availableLabRoles.map(role => [role.id, role.name]));
      newLabMembersData = rawLabMembers.map(member => ({
        ...member,
        labRoleName: member.labRoleId ? roleMap.get(member.labRoleId) || 'Unknown Role' : 'N/A',
      }));
    } else if (rawLabMembers.length > 0) {
      newLabMembersData = rawLabMembers.map(member => ({ ...member, labRoleName: 'Loading Role...'}));
    } else {
      newLabMembersData = []; 
    }
    setLabMembers(newLabMembersData);
    // console.log("useEffect: Members updated with role names:", newLabMembersData);

    if (isManageStatusModalOpen) { 
      setMemberForStatusModal(currentMemberInModal => {
        if (!currentMemberInModal) return null; 
        const updatedDetails = newLabMembersData.find(m => m.memberID === currentMemberInModal.memberID);
        return updatedDetails || null; 
      });
    }
  }, [rawLabMembers, availableLabRoles, isManageStatusModalOpen]);

  useEffect(() => {
    if (labDetails) {
      const changed =
        editableName !== labDetails.name ||
        editableLocation !== labDetails.location ||
        editableStatus !== labDetails.status;
      setHasUnsavedChanges(changed);
    }
  }, [editableName, editableLocation, editableStatus, labDetails]);

  const handleOpenManageStatusesModal = useCallback(async (member: LabMemberData) => {
    setMemberForStatusModal(member);
    setSelectedMemberContacts(null); // Reset previously fetched contacts
    setIsLoadingContacts(true);
    setIsManageStatusModalOpen(true); // Open modal
    try {
      // console.log(`Fetching contacts for user ID: ${member.id}`);
      const response = await api.get(`/user/${member.id}/contacts`); 
      setSelectedMemberContacts(response.data);
      // console.log("Contacts fetched successfully:", response.data);
      // Placeholder for toast: alert(`Fetched ${response.data.length} contacts for ${member.displayName}. Modal would open here.`);
    } catch (err: any) {
      console.error(`Failed to fetch contacts for user ID: ${member.id}`, err);
      // Placeholder for toast: alert(`Failed to fetch contacts for ${member.displayName}.`);
    } finally {
      setIsLoadingContacts(false);
    }
  }, []);

  const handleSetActiveStatus = async (memberStatusIdToActivate: number) => {
    if (!memberForStatusModal) return;

    // Refetching for now, update/show loader later
    try {
      console.log(`Attempting to activate MemberStatus ID: ${memberStatusIdToActivate}`);
      await api.put(`/admin/member-status/${memberStatusIdToActivate}/activate`);
      
      // Placeholder for toast: alert('Status activated successfully! Refreshing member data.');

      // Refetch lab members to update status list
      // Triggers useEffect to update labMembers and memberForStatusModal
      await fetchLabMembers(); 

      // Post-refetch, useEffect will find the updated memberForStatusModal data
      // from the refreshed labMembers list and update the modal content

    } catch (err: any) {
      console.error(`Failed to activate MemberStatus ID: ${memberStatusIdToActivate}`, err);
      // Placeholder for toast: alert(err.response?.data?.error || `Failed to activate status.`)
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
    if (editingMemberStatusId === null) return;
    setIsSavingDescription(true);
    try {
      await api.put(`/admin/member-status/${editingMemberStatusId}`, { description: currentEditingDescription });
      // Placeholder for toast: alert("Description updated!");
      await fetchLabMembers(); // Refetch to update UI
      setEditingMemberStatusId(null); // Close editing input
      setCurrentEditingDescription("");
    } catch (err: any) {
      console.error("Failed to update description", err);
      alert(err.response?.data?.error || "Failed to save description.");
    } finally {
      setIsSavingDescription(false);
    }
  };

  const handleOpenConfirmDeleteDialog = (memberStatusId: number) => {
    setStatusToDeleteId(memberStatusId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDeleteStatus = async () => {
    if (statusToDeleteId === null) return;
    setIsDeletingStatus(true);
    try {
      await api.delete(`/admin/member-status/${statusToDeleteId}`);
      // Placeholder for toast: alert("Status entry deleted!");
      await fetchLabMembers(); // Refresh data
      setIsConfirmDeleteDialogOpen(false);
      setStatusToDeleteId(null);
    } catch (err: any) {
      console.error("Failed to delete status entry", err);
      alert(err.response?.data?.error || "Failed to delete status entry.");
    } finally {
      setIsDeletingStatus(false);
    }
  };

  const handleSaveNewStatus = async () => {
    if (!memberForStatusModal || !newStatusSelectedGlobalStatusId || !newStatusSelectedContactId) {
      // Placeholder for toast: alert("Please select a global status, a contact, and provide a description.");
      return;
    }
    setIsCreatingNewStatus(true);
    try {
      const payload = {
        statusId: parseInt(newStatusSelectedGlobalStatusId),
        contactId: parseInt(newStatusSelectedContactId),
        description: newStatusDescription,
      };
      
      await api.post(`/admin/lab-member/${memberForStatusModal.memberID}/status`, payload);
      
      // Placeholder for toast: alert("New status entry created successfully!");
      await fetchLabMembers(); 

      // Clear form fields
      setNewStatusSelectedGlobalStatusId("");
      setNewStatusSelectedContactId("");
      setNewStatusDescription("");

    } catch (err: any) {
      console.error("Failed to create new status entry", err);
      alert(err.response?.data?.error || "Failed to create new status entry.");
    } finally {
      setIsCreatingNewStatus(false);
    }
  };

  const handleUpdateLabDetails = async () => {
    if (!labDetails) return;
    if (!hasUnsavedChanges) return;

    setIsUpdating(true);
    setError(null);
    try {
      const payload = {
        name: editableName,
        location: editableLocation,
        status: editableStatus,
      };
      const response = await api.put(`/admin/lab/${labDetails.id}`, payload);
      setLabDetails(response.data);
      setEditableName(response.data.name);
      setEditableLocation(response.data.location);
      setEditableStatus(response.data.status);
      // Placeholder for toast: alert('Lab details updated successfully!');
    } catch (err: any) {
      console.error("Error updating lab details:", err);
      setError(err.response?.data?.error || err.message || "Failed to update lab details.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenChangeRoleModal = (member: LabMemberData) => {
    setMemberForRoleChange(member);
    setSelectedNewLabRoleId(member.labRoleId?.toString() || ""); // Pre-fill with current role
    setIsChangeRoleModalOpen(true);
  };

  const handleSaveLabRole = async () => {
    if (!memberForRoleChange || !selectedNewLabRoleId) {
      // Placeholder for toast: alert("Please select a new role.");
      return;
    }
    setIsSavingRole(true);
    try {
      await api.put(`/admin/lab-member/${memberForRoleChange.memberID}/role`, { 
        newLabRoleId: parseInt(selectedNewLabRoleId)
      });
      // Placeholder for toast: alert("Lab role updated successfully!");
      await fetchLabMembers(); // Refresh list
      setIsChangeRoleModalOpen(false); 
      setMemberForRoleChange(null);
      setSelectedNewLabRoleId("");
    } catch (err: any) {
      console.error("Failed to update lab role:", err);
      alert(err.response?.data?.error || "Failed to update lab role.");
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleToggleInduction = async (member: LabMemberData) => {
    // Update could be done here, refetchcing for now
    try {
      await api.put(`/admin/lab-member/${member.memberID}/induction`);
      // Placeholder for toast: alert(`Induction status for ${member.displayName} toggled! Refreshing list.`);
      await fetchLabMembers(); // Refresh list
    } catch (err: any) {
      console.error(`Failed to toggle induction for ${member.displayName}:`, err);
      // Placeholder for toast: alert(err.response?.data?.error || `Failed to toggle induction status.`);
    }
  };

  const handleOpenRemoveMemberConfirm = (member: LabMemberData) => {
    setMemberToRemove(member);
    setIsRemoveMemberConfirmOpen(true);
  };

  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove || !labDetails) {
      alert("Error: Member or Lab details missing for removal.");
      return;
    }
    setIsRemovingMember(true);
    try {
      // DELETE request to /admin/remove-user with labId and userId in body
      await api.delete('/admin/remove-user', { 
        data: { 
          labId: labDetails.id, 
          userId: memberToRemove.id // member.id is the User ID
        } 
      });
      // Placeholder for toast: alert(`${memberToRemove.displayName} has been removed from the lab.`);
      await fetchLabMembers();
      setIsRemoveMemberConfirmOpen(false);
      setMemberToRemove(null);
    } catch (err: any) {
      console.error(`Failed to remove ${memberToRemove.displayName}:`, err);
      alert(err.response?.data?.error || `Failed to remove member.`);
    } finally {
      setIsRemovingMember(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center sm:text-left">
        Manage Lab: {loading ? <Loader2 className="h-8 w-8 animate-spin inline-block" /> : labDetails?.name || `ID ${params.id}`}
      </h1>
      
      <Tabs defaultValue="details" className="w-full">
        <div className="overflow-x-auto pb-2 mb-4">
          <TabsList className="min-w-max sm:w-full grid grid-flow-col sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 auto-cols-max sm:auto-cols-fr gap-2">
            <TabsTrigger value="details" className="px-4 py-2">Lab Details</TabsTrigger>
            <TabsTrigger value="members" className="px-4 py-2">Members</TabsTrigger>
            <TabsTrigger value="inventory" className="px-4 py-2">Inventory</TabsTrigger>
            <TabsTrigger value="clock_log" className="px-4 py-2">Clock-in Log</TabsTrigger>
            <TabsTrigger value="inventory_log" className="px-4 py-2">Inventory Log</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Lab Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading && (
                <div className="flex justify-center items-center min-h-[200px]">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              )}
              {error && (
                <div className="flex flex-col items-center justify-center min-h-[200px] text-destructive">
                  <AlertCircle className="h-12 w-12 mb-2" />
                  <p className="text-center">{error}</p>
                  <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
                </div>
              )}
              {!loading && !error && labDetails && (
                <>
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
                </>
              )}
            </CardContent>
            {!loading && !error && labDetails && (
              <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleUpdateLabDetails} disabled={!hasUnsavedChanges || isUpdating}>
                  {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="members">
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
                  <Button variant="outline" className="mt-4" onClick={fetchLabMembers}>Retry</Button>
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
                        <p className="text-sm text-gray-600">Role: {member.labRoleName || 'N/A'}</p>
                        <p className="text-sm text-gray-500">
                          Induction: {member.inductionDone ? 
                            <span className="text-green-600 font-medium">Completed</span> : 
                            <span className="text-orange-600 font-medium">Pending</span>
                          }
                        </p>
                      </div>
                      <div className="flex space-x-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => handleOpenManageStatusesModal(member)} className="flex items-center">
                          <UserCog className="mr-1 h-4 w-4" /> Statuses
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenChangeRoleModal(member)} className="flex items-center">
                          <Users className="mr-1 h-4 w-4" /> Role
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleToggleInduction(member)} 
                          className={`flex items-center ${member.inductionDone ? 'text-green-600 hover:text-green-700' : 'text-orange-600 hover:text-orange-700'}`}
                        >
                           <Edit3 className="mr-1 h-4 w-4" /> {member.inductionDone ? "Mark Pending" : "Mark Done"}
                        </Button>
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
        </TabsContent>

        <TabsContent value="inventory">
          <div className="p-4 border rounded-md min-h-[300px]">
            <h2 className="text-xl font-semibold mb-4">Manage Lab Inventory</h2>
            <p>Content for managing inventory specific to this lab will go here for Lab ID: {params.id}</p>
          </div>
        </TabsContent>

        <TabsContent value="clock_log">
          <div className="p-4 border rounded-md min-h-[300px]">
            <h2 className="text-xl font-semibold mb-4">Clock-in Log</h2>
            <p>Content for viewing clock-in logs for this lab will go here for Lab ID: {params.id}</p>
          </div>
        </TabsContent>

        <TabsContent value="inventory_log">
          <div className="p-4 border rounded-md min-h-[300px]">
            <h2 className="text-xl font-semibold mb-4">Inventory Log</h2>
            <p>Content for viewing inventory logs for this lab will go here for Lab ID: {params.id}</p>
          </div>
        </TabsContent>
      </Tabs>

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

                {/* Section for Creating New MemberStatus (placeholder) */}
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
                  {availableLabRoles.map(role => (
                    <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableLabRoles.length === 0 && <p className="text-xs text-red-500">No lab roles available to select.</p>}
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

    </div>
  );
} 