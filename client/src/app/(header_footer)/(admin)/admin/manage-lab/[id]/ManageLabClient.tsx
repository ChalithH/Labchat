"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, UserCog, Users, Trash2, Edit3, Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format } from 'date-fns';

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
  isPCI: boolean;
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

interface AttendanceLog {
  id: number;
  memberId: number;
  memberName: string;
  memberRole: string;
  clockIn: string;
  clockOut: string | null;
  duration: number | null; // in minutes
  isActive: boolean;
}

interface AttendancePagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function ManageLabClient({ params }: ManageLabClientProps) {
  const [labDetails, setLabDetails] = useState<LabDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

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

  const [isUpdatingPCIForMemberId, setIsUpdatingPCIForMemberId] = useState<number | null>(null);
  const [isUpdatingInductionForMemberId, setIsUpdatingInductionForMemberId] = useState<number | null>(null);

  // State for Clock-in Log
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [attendancePagination, setAttendancePagination] = useState<AttendancePagination>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0
  });
  const [attendanceFilters, setAttendanceFilters] = useState({
    startDate: '',
    endDate: '',
    memberId: 'all'
  });

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
      const rawMembersDataFromApi = response.data; // This is the array from the backend (already flattened)

      const initialMappedMembers: LabMemberData[] = rawMembersDataFromApi.map((member: any) => ({
        // User-related fields are now at the top-level of the 'member' object from the API
        id: member.id, // This is User ID
        firstName: member.firstName,
        lastName: member.lastName,
        displayName: member.displayName,
        jobTitle: member.jobTitle,
        office: member.office,
        bio: member.bio,
        
        // LabMember specific fields from the API response
        memberID: member.memberID, // This is the LabMember ID
        labID: member.labID,
        labRoleId: member.labRoleId,
        createdAt: member.createdAt,
        inductionDone: member.inductionDone,
        isPCI: member.isPCI, 
        status: member.status, // Check if the server sends this as 'status' or 'memberStatus'
                                // The server controller maps it as 'status: member.memberStatus'
      }));

      setRawLabMembers(initialMappedMembers);
      setLabMembers(initialMappedMembers);
      
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

  const fetchAttendanceLogs = useCallback(async (page: number = 1) => {
    if (!params.id) return;
    setIsLoadingAttendance(true);
    setAttendanceError(null);
    
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: attendancePagination.limit.toString(),
      });
      
      if (attendanceFilters.startDate) {
        queryParams.append('startDate', attendanceFilters.startDate);
      }
      if (attendanceFilters.endDate) {
        queryParams.append('endDate', attendanceFilters.endDate);
      }
      if (attendanceFilters.memberId && attendanceFilters.memberId !== 'all') {
        queryParams.append('memberId', attendanceFilters.memberId);
      }
      
      const response = await api.get(`/attendance/logs/${params.id}?${queryParams.toString()}`);
      setAttendanceLogs(response.data.logs);
      setAttendancePagination(response.data.pagination);
    } catch (err: any) {
      console.error("Failed to fetch attendance logs:", err);
      setAttendanceError(err.response?.data?.message || "Failed to load attendance logs");
    } finally {
      setIsLoadingAttendance(false);
    }
  }, [params.id, attendancePagination.limit, attendanceFilters]);

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
    // Fetch attendance logs when clock_log tab is selected
    if (activeTab === "clock_log" && params.id) {
      fetchAttendanceLogs(1);
    }
  }, [activeTab, params.id, fetchAttendanceLogs]);

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
    if (!member || typeof member.memberID === 'undefined') {
      console.error("handleToggleInduction: Invalid member data provided.");
      toast.error("Error", { description: "Could not update induction status due to invalid member data." });
      return;
    }
    setIsUpdatingInductionForMemberId(member.memberID);
    try {
      await api.put(`/admin/lab-member/${member.memberID}/induction`);
      
      setLabMembers(prevMembers =>
        prevMembers.map(m =>
          m.memberID === member.memberID ? { ...m, inductionDone: !m.inductionDone } : m
        )
      );
      setRawLabMembers(prevMembers => 
        prevMembers.map(m =>
            m.memberID === member.memberID ? { ...m, inductionDone: !m.inductionDone } : m
        )
      );

      toast.success("Induction Updated", {
        description: `${member.displayName}'s induction status toggled!`,
      });
    } catch (err: any) {
      console.error(`Failed to toggle induction for ${member.displayName}:`, err);
      toast.error("Update Failed", {
        description: err.response?.data?.error || `Failed to toggle induction status.`,
      });
      // Revert optimistic update if API call fails
      setLabMembers(prevMembers =>
        prevMembers.map(m =>
          m.memberID === member.memberID ? { ...m, inductionDone: member.inductionDone } : m
        )
      );
      setRawLabMembers(prevMembers => 
        prevMembers.map(m =>
            m.memberID === member.memberID ? { ...m, inductionDone: member.inductionDone } : m
        )
      );
    } finally {
      setIsUpdatingInductionForMemberId(null);
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

  const handleTogglePCIMember = async (memberToUpdate: LabMemberData) => {
    if (!memberToUpdate || typeof memberToUpdate.memberID === 'undefined') {
      console.error("handleTogglePCIMember: Invalid member data provided.");
      toast.error("Error", {
        description: "Could not update PCI status due to invalid member data.",
      });
      return;
    }
    
    setIsUpdatingPCIForMemberId(memberToUpdate.memberID);
    try {
      const response = await api.put(`/admin/lab-member/${memberToUpdate.memberID}/pci`, {
        isPCI: !memberToUpdate.isPCI,
      });
      
      setLabMembers(prevMembers =>
        prevMembers.map(member =>
          member.memberID === memberToUpdate.memberID ? { ...member, isPCI: !memberToUpdate.isPCI } : member
        )
      );
      setRawLabMembers(prevMembers => 
        prevMembers.map(member =>
            member.memberID === memberToUpdate.memberID ? { ...member, isPCI: !memberToUpdate.isPCI } : member
        )
      );

      toast.success("Success", {
        description: `${memberToUpdate.displayName}'s PCI status updated.`,
      });
    } catch (error: any) {
      console.error("Failed to toggle PCI status for member:", memberToUpdate.memberID, error);
      toast.error("Error updating PCI status", {
        description: error.response?.data?.message || "Could not update PCI status.",
      });
    } finally {
      setIsUpdatingPCIForMemberId(null);
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (minutes === null) return 'Ongoing';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const handleAttendancePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= attendancePagination.totalPages) {
      fetchAttendanceLogs(newPage);
    }
  };

  const handleApplyFilters = () => {
    fetchAttendanceLogs(1); // Reset to page 1 when applying filters
  };

  const handleClearFilters = () => {
    setAttendanceFilters({
      startDate: '',
      endDate: '',
      memberId: 'all'
    });
    // Trigger refetch after state update
    setTimeout(() => fetchAttendanceLogs(1), 0);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center sm:text-left">
        Manage Lab: {loading ? <Loader2 className="h-8 w-8 animate-spin inline-block" /> : labDetails?.name || `ID ${params.id}`}
      </h1>
      
      <Tabs defaultValue="details" className="w-full" value={activeTab} onValueChange={setActiveTab}>
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
                        <p className="text-sm text-gray-500">
                          PCI Access: {member.isPCI ? 
                            <span className="text-blue-600 font-medium">Enabled</span> : 
                            <span className="text-gray-600 font-medium">Disabled</span>
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
                                aria-label={`Toggle PCI Access for ${member.displayName}`}
                            />
                            <Label htmlFor={`pci-toggle-${member.memberID}`} className="text-sm cursor-pointer select-none">
                                PCI Access
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Clock-in Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
                <h3 className="font-semibold text-sm">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-sm">Start Date</Label>
                    <Input 
                      id="startDate"
                      type="date" 
                      value={attendanceFilters.startDate}
                      onChange={(e) => setAttendanceFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-sm">End Date</Label>
                    <Input 
                      id="endDate"
                      type="date" 
                      value={attendanceFilters.endDate}
                      onChange={(e) => setAttendanceFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="memberSelect" className="text-sm">Member</Label>
                    <Select 
                      value={attendanceFilters.memberId}
                      onValueChange={(value) => setAttendanceFilters(prev => ({ ...prev, memberId: value }))}
                    >
                      <SelectTrigger id="memberSelect">
                        <SelectValue placeholder="All members" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All members</SelectItem>
                        {labMembers.map(member => (
                          <SelectItem key={member.memberID} value={member.memberID.toString()}>
                            {member.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={handleApplyFilters} size="sm" className="flex-1">
                      Apply
                    </Button>
                    <Button onClick={handleClearFilters} variant="outline" size="sm" className="flex-1">
                      Clear
                    </Button>
                  </div>
                </div>
              </div>

              {/* Attendance Logs Table */}
              {isLoadingAttendance && (
                <div className="flex justify-center items-center min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2">Loading attendance logs...</p>
                </div>
              )}
              
              {attendanceError && (
                <div className="flex flex-col items-center justify-center min-h-[200px] text-destructive">
                  <AlertCircle className="h-8 w-8 mb-2" />
                  <p className="text-center">{attendanceError}</p>
                  <Button variant="outline" className="mt-4" onClick={() => fetchAttendanceLogs(1)}>Retry</Button>
                </div>
              )}

              {!isLoadingAttendance && !attendanceError && attendanceLogs.length === 0 && (
                <p className="text-center text-gray-500 py-8">No attendance logs found.</p>
              )}

              {!isLoadingAttendance && !attendanceError && attendanceLogs.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Member</th>
                        <th className="text-left p-2 font-medium">Role</th>
                        <th className="text-left p-2 font-medium">Clock In</th>
                        <th className="text-left p-2 font-medium">Clock Out</th>
                        <th className="text-left p-2 font-medium">Duration</th>
                        <th className="text-left p-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceLogs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{log.memberName}</td>
                          <td className="p-2">{log.memberRole}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-500" />
                              {format(new Date(log.clockIn), 'MMM d, yyyy')}
                              <Clock className="h-3 w-3 text-gray-500 ml-2" />
                              {format(new Date(log.clockIn), 'HH:mm')}
                            </div>
                          </td>
                          <td className="p-2">
                            {log.clockOut ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-500" />
                                {format(new Date(log.clockOut), 'MMM d, yyyy')}
                                <Clock className="h-3 w-3 text-gray-500 ml-2" />
                                {format(new Date(log.clockOut), 'HH:mm')}
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="p-2">{formatDuration(log.duration)}</td>
                          <td className="p-2">
                            {log.isActive ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Completed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            
            {/* Pagination */}
            {!isLoadingAttendance && !attendanceError && attendancePagination.totalPages > 1 && (
              <CardFooter className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Page {attendancePagination.page} of {attendancePagination.totalPages} 
                  <span className="ml-2">({attendancePagination.totalCount} total records)</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAttendancePageChange(attendancePagination.page - 1)}
                    disabled={attendancePagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAttendancePageChange(attendancePagination.page + 1)}
                    disabled={attendancePagination.page === attendancePagination.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
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