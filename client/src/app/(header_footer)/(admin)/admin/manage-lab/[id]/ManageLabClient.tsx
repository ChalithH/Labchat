"use client";


import React, { useEffect, useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, UserCog, Users, Trash2, Edit3, Clock, Calendar, ChevronLeft, ChevronRight, UserPlus, Key } from 'lucide-react';
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
import LabInventoryComponent from './components/LabInventoryComponent';
import InventoryLogComponent from './components/InventoryLogComponent';
import AddMembersComponent from './components/AddMembersComponent';

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
  permissionLevel: number;
  description?: string;
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
  isUserAdmin?: boolean;
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
  isRootAdmin: boolean;
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

export default function ManageLabClient({ params, isRootAdmin }: ManageLabClientProps) {
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

  // State for Password Reset
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);
  const [memberForPasswordReset, setMemberForPasswordReset] = useState<LabMemberData | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // State for Remove Lab confirmation
  const [isRemoveLabConfirmOpen, setIsRemoveLabConfirmOpen] = useState(false);
  const [isDeletingLab, setIsDeletingLab] = useState(false);

  // State for Lab Roles tab
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRolePermissionLevel, setNewRolePermissionLevel] = useState<string>('');

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

      // Fetch user role information for each member to check if they're admin
      const memberPromises = rawMembersDataFromApi.map(async (member: any) => {
        try {
          // Get the user details including role to check if they're admin
          const userResponse = await api.get(`/user/get/${member.id}`);
          const userData = userResponse.data;
          
          // Fetch role details from roleId
          let isUserAdmin = false;
          if (userData.roleId) {
            try {
              const roleResponse = await api.get(`/role/get/${userData.roleId}`);
              const roleData = roleResponse.data;
              isUserAdmin = roleData && roleData.permissionLevel >= 100;
            } catch (roleErr) {
              console.error(`Failed to fetch role for user ${member.id}`, roleErr);
            }
          }
          
          return {
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
            isUserAdmin: isUserAdmin
          };
        } catch (err) {
          console.error(`Failed to fetch user role for member ${member.id}`, err);
          // If user role fetch fails, assume they aren't admin (safety)
          return {
            id: member.id, // User ID
            firstName: member.firstName,
            lastName: member.lastName,
            displayName: member.displayName,
            jobTitle: member.jobTitle,
            office: member.office,
            bio: member.bio,
            
            // LabMember specific fields from the API response
            memberID: member.memberID, // LabMember ID
            labID: member.labID,
            labRoleId: member.labRoleId,
            createdAt: member.createdAt,
            inductionDone: member.inductionDone,
            isPCI: member.isPCI, 
            status: member.status,
            isUserAdmin: false // Default to false if we can't determine
          };
        }
      });

      const initialMappedMembers: LabMemberData[] = await Promise.all(memberPromises);

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

    try {
      console.log(`Attempting to activate MemberStatus ID: ${memberStatusIdToActivate}`);
      await api.put(`/admin/member-status/${memberStatusIdToActivate}/activate`);
      
      // Optimistically update member status - set this status as active, and all others as inactive
      const updateMemberStatus = (member: LabMemberData) => {
        if (member.memberID !== memberForStatusModal.memberID) return member;
        
        const updatedStatuses = member.status.map(status => ({
          ...status,
          isActive: status.id === memberStatusIdToActivate
        }));
        
        return { ...member, status: updatedStatuses };
      };

      // Update both state arrays
      setLabMembers(prevMembers => prevMembers.map(updateMemberStatus));
      setRawLabMembers(prevMembers => prevMembers.map(updateMemberStatus));
      
      // Update modal member data
      setMemberForStatusModal(prevMember => 
        prevMember ? updateMemberStatus(prevMember) : null
      );

      // Toast alert? (Todo)

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
    if (editingMemberStatusId === null || !memberForStatusModal) return;
    setIsSavingDescription(true);
    try {
      await api.put(`/admin/member-status/${editingMemberStatusId}`, { description: currentEditingDescription });
      
      // Optimistically update the description
      const updateMemberDescription = (member: LabMemberData) => {
        if (member.memberID !== memberForStatusModal.memberID) return member;
        
        const updatedStatuses = member.status.map(status =>
          status.id === editingMemberStatusId 
            ? { ...status, description: currentEditingDescription }
            : status
        );
        
        return { ...member, status: updatedStatuses };
      };

      // Update both state arrays
      setLabMembers(prevMembers => prevMembers.map(updateMemberDescription));
      setRawLabMembers(prevMembers => prevMembers.map(updateMemberDescription));
      
      // Update modal member data
      setMemberForStatusModal(prevMember => 
        prevMember ? updateMemberDescription(prevMember) : null
      );

      // Placeholder for toast: alert("Description updated!");
      setEditingMemberStatusId(null);
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
    if (statusToDeleteId === null || !memberForStatusModal) return;
    setIsDeletingStatus(true);
    try {
      await api.delete(`/admin/member-status/${statusToDeleteId}`);
      
      // Optimistically remove the status entry
      const updateMemberStatuses = (member: LabMemberData) => {
        if (member.memberID !== memberForStatusModal.memberID) return member;
        
        const updatedStatuses = member.status.filter(status => status.id !== statusToDeleteId);
        return { ...member, status: updatedStatuses };
      };

      // Update both state arrays
      setLabMembers(prevMembers => prevMembers.map(updateMemberStatuses));
      setRawLabMembers(prevMembers => prevMembers.map(updateMemberStatuses));
      
      // Update modal member data
      setMemberForStatusModal(prevMember => 
        prevMember ? updateMemberStatuses(prevMember) : null
      );

      // Placeholder for toast: alert("Status entry deleted!");
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
      
      const response = await api.post(`/admin/lab-member/${memberForStatusModal.memberID}/status`, payload);
      
      // Get the created status data from response
      
      const newStatusEntry: MemberStatusEntry = response.data || {
        id: Date.now(), // Will be replaced on next refresh if needed
        contactId: parseInt(newStatusSelectedContactId),
        statusId: parseInt(newStatusSelectedGlobalStatusId),
        isActive: false,
        description: newStatusDescription,
        contact: selectedMemberContacts?.find(c => c.id === parseInt(newStatusSelectedContactId)) || {
          id: parseInt(newStatusSelectedContactId),
          type: 'Unknown',
          info: 'Unknown',
          name: 'Unknown'
        },
        status: globalStatuses.find(s => s.id === parseInt(newStatusSelectedGlobalStatusId)) || {
          id: parseInt(newStatusSelectedGlobalStatusId),
          statusName: 'Unknown',
          statusWeight: 0
        }
      };

      // Optimistically add the new status entry
      const updateMemberWithNewStatus = (member: LabMemberData) => {
        if (member.memberID !== memberForStatusModal.memberID) return member;
        return { ...member, status: [...member.status, newStatusEntry] };
      };

      // Update both state arrays
      setLabMembers(prevMembers => prevMembers.map(updateMemberWithNewStatus));
      setRawLabMembers(prevMembers => prevMembers.map(updateMemberWithNewStatus));
      
      // Update modal member data
      setMemberForStatusModal(prevMember => 
        prevMember ? updateMemberWithNewStatus(prevMember) : null
      );

      // Placeholder for toast: alert("New status entry created successfully!");

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
      
      // Find the new role name for optimistic update
      const newRole = availableLabRoles.find(role => role.id === parseInt(selectedNewLabRoleId));
      const newRoleName = newRole ? newRole.name : 'Unknown Role';
      
      // Update both labMembers and rawLabMembers states optimistically to preserve order on frontend
      setLabMembers(prevMembers =>
        prevMembers.map(member =>
          member.memberID === memberForRoleChange.memberID 
            ? { ...member, labRoleId: parseInt(selectedNewLabRoleId), labRoleName: newRoleName }
            : member
        )
      );
      setRawLabMembers(prevMembers => 
        prevMembers.map(member =>
          member.memberID === memberForRoleChange.memberID 
            ? { ...member, labRoleId: parseInt(selectedNewLabRoleId) }
            : member
        )
      );
      
      // Placeholder for toast: alert("Lab role updated successfully!");
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
      
      // Optimistically remove the member from the UI (since now a former member)
      setLabMembers(prevMembers => 
        prevMembers.filter(member => member.memberID !== memberToRemove.memberID)
      );
      setRawLabMembers(prevMembers => 
        prevMembers.filter(member => member.memberID !== memberToRemove.memberID)
      );

      // Placeholder for toast: alert(`${memberToRemove.displayName} has been removed from the lab.`);
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
    if (isUpdatingPCIForMemberId) return; // Prevent multiple/concurrent requests
    setIsUpdatingPCIForMemberId(memberToUpdate.memberID);
    try {
      const response = await api.put(`/admin/lab-member/${memberToUpdate.memberID}/pci`, {
        isPCI: !memberToUpdate.isPCI // Send new value in req body
      });
      console.log("PIC toggle API response:", response.data);
      
      // Update in state (both labMembers and rawLabMembers) 
      const updatePCI = (member: LabMemberData) => 
        member.memberID === memberToUpdate.memberID ? 
          { ...member, isPCI: !member.isPCI } : member;
      
      setLabMembers(prevMembers => prevMembers.map(updatePCI));
      setRawLabMembers(prevMembers => prevMembers.map(updatePCI));
      
      toast.success(`PIC ${!memberToUpdate.isPCI ? 'assigned to' : 'removed from'} ${memberToUpdate.displayName}`);

    } catch (err: any) {
      console.error("Failed to toggle PIC for member:", err);
      toast.error(err.response?.data?.error || 'Failed to update PIC status');
    } finally {
      setIsUpdatingPCIForMemberId(null);
    }
  };

  // Password Reset Handlers
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
      await api.put(`/admin/lab/${params.id}/reset-member-password`, {
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

  const handleDeleteLab = async () => {
    if (!labDetails) return;
    
    setIsDeletingLab(true);
    try {
      await api.delete(`/admin/lab/${params.id}`);
      toast.success(`Lab "${labDetails.name}" has been permanently deleted`);
      
      // Redirect to admin dashboard after successful deletion
      window.location.href = '/admin/dashboard';
    } catch (error: any) {
      console.error('Failed to delete lab:', error);
      toast.error(error.response?.data?.error || 'Failed to delete lab');
    } finally {
      setIsDeletingLab(false);
      setIsRemoveLabConfirmOpen(false);
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
    fetchAttendanceLogs(1);
  };

  // Lab Roles handlers
  const handleCreateLabRole = async () => {
    if (!newRoleName.trim() || !newRolePermissionLevel) {
      toast.error('Role name and permission level are required');
      return;
    }

    const permissionLevel = parseInt(newRolePermissionLevel);
    if (isNaN(permissionLevel) || permissionLevel < 0 || permissionLevel > 100) {
      toast.error('Permission level must be a number between 0 and 100');
      return;
    }

    setIsCreatingRole(true);
    try {
      const response = await api.post('/admin/create-lab-role', {
        name: newRoleName.trim(),
        description: newRoleDescription.trim() || null,
        permissionLevel: permissionLevel
      });

      toast.success(`Lab role "${newRoleName}" created successfully!`);
      
      // Clear form
      setNewRoleName('');
      setNewRoleDescription('');
      setNewRolePermissionLevel('');
      
      // Refresh lab roles
      await fetchLabRoles();
    } catch (err: any) {
      console.error('Error creating lab role:', err);
      toast.error(err.response?.data?.error || 'Failed to create lab role');
    } finally {
      setIsCreatingRole(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
           <div className="relative flex flex-col items-center mb-8 lg:flex-row lg:justify-center">
        <h1 className="font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)] text-center order-1 lg:order-none">
          Manage Lab: {loading ? <Loader2 className="h-8 w-8 animate-spin inline-block" /> : labDetails?.name || `ID ${params.id}`}
        </h1>
        <div className="lg:absolute lg:left-0 order-2 lg:order-none mb-2 lg:mb-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard">Admin Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Manage Inventory</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      
      <Tabs defaultValue="details" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2 mb-4">
          <TabsList className="min-w-max sm:w-full grid grid-flow-col sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 auto-cols-max sm:auto-cols-fr gap-2">
            <TabsTrigger value="details" className="px-4 py-2">Lab Details</TabsTrigger>
            <TabsTrigger value="lab_roles" className="px-4 py-2">Lab Roles</TabsTrigger>
            <TabsTrigger value="members" className="px-4 py-2">Manage Members</TabsTrigger>
            <TabsTrigger value="add_members" className="px-4 py-2">Add Members</TabsTrigger>
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
            )}
          </Card>
        </TabsContent>

        <TabsContent value="lab_roles">
          <Card>
            <CardHeader>
              <CardTitle>Create Lab Role</CardTitle>
              <p className="text-sm text-gray-600">
                Create new lab roles when needed. View role assignments and permission levels in the &quot;Manage Members&quot; tab.
              </p>
            </CardHeader>
            <CardContent>
              {/* Create New Role Section */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Role name (e.g., Senior Technician)"
                    disabled={isCreatingRole}
                  />
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={newRolePermissionLevel}
                    onChange={(e) => setNewRolePermissionLevel(e.target.value)}
                    placeholder="Permission level (0-100)"
                    disabled={isCreatingRole}
                  />
                </div>
                <Input
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="Description (optional)"
                  disabled={isCreatingRole}
                />

                <div className="flex justify-end">
                  <Button
                    onClick={handleCreateLabRole}
                    disabled={!newRoleName.trim() || !newRolePermissionLevel || isCreatingRole}
                  >
                    {isCreatingRole ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Role
                  </Button>
                </div>
              </div>
            </CardContent>
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
                        <p className="text-sm text-gray-600">
                          Role: {member.labRoleName || 'N/A'}
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
        </TabsContent>

        <TabsContent value="add_members">
          {activeTab === "add_members" ? (
            <AddMembersComponent 
              labId={parseInt(params.id)} 
              availableLabRoles={availableLabRoles}
              onUserAdded={fetchLabMembers}
            />
          ) : (
            <Card>
              <CardContent className="flex justify-center items-center min-h-[200px]">
                <div className="text-center text-gray-500">
                  <UserPlus className="h-12 w-12 mx-auto mb-4" />
                  <p>Select this tab to load available users</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inventory">
          <LabInventoryComponent labId={parseInt(params.id)} />
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
          <InventoryLogComponent labId={parseInt(params.id)} />
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
                  {availableLabRoles
                    .filter(role => role.name.toLowerCase() !== 'former member') // Filter out "Former Member" role
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
              {/* <DialogDescription>
              Set a temporary password. The member should change it after logging in.
              </DialogDescription> */}
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
                  {/* <li>• This action will be logged for security purposes</li> */}
                  
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

    </div>
  );
} 