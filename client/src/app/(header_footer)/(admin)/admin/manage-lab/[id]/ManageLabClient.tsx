"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import api from '@/lib/api'; 
import { toast } from "sonner";

// Import tab components
import LabDetailsTab from './tabs/LabDetailsTab';
import LabRolesTab from './tabs/LabRolesTab';
import ManageMembersTab from './tabs/ManageMembersTab';
import AddMembersTab from './tabs/AddMembersTab';
import InventoryTab from './tabs/InventoryTab';
import ClockLogTab from './tabs/ClockLogTab';
import InventoryLogTab from './tabs/InventoryLogTab';
import AdmissionRequestsTab from './tabs/AdmissionRequestsTab';

// Import types
import { LabDetails, LabRoleData, LabMemberData } from './types/LabTypes';

interface ManageLabClientProps {
  params: { id: string };
  isRootAdmin: boolean;
}

export default function ManageLabClient({ params, isRootAdmin }: ManageLabClientProps) {
  const [labDetails, setLabDetails] = useState<LabDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");

  // Lab members and roles state
  const [labMembers, setLabMembers] = useState<LabMemberData[]>([]);
  const [availableLabRoles, setAvailableLabRoles] = useState<LabRoleData[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  const fetchLabDetails = useCallback(async () => {
    if (!params.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/admin/get-lab/${params.id}`);
      setLabDetails(response.data);
    } catch (err: any) {
      console.error("Failed to fetch lab details:", err);
      setError(err.response?.data?.error || err.message || "Failed to fetch lab details.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const fetchLabMembers = useCallback(async () => {
    if (!params.id) return;
    setIsLoadingMembers(true);
    setMembersError(null);
    try {
      const response = await api.get(`/lab/getMembers/${params.id}`);
      const rawMembersDataFromApi = response.data;

      const memberPromises = rawMembersDataFromApi.map(async (member: any) => {
        try {
          const userResponse = await api.get(`/user/get/${member.id}`);
          const userData = userResponse.data;
          
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
            isPCI: member.isPCI, 
            status: member.status,
            isUserAdmin: isUserAdmin
          };
        } catch (err) {
          console.error(`Failed to fetch user role for member ${member.id}`, err);
          return {
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
            isPCI: member.isPCI, 
            status: member.status,
            isUserAdmin: false
          };
        }
      });

      const mappedMembers: LabMemberData[] = await Promise.all(memberPromises);
      setLabMembers(mappedMembers);
      
    } catch (err: any) {
      console.error("Failed to fetch lab members:", err);
      setMembersError(err.response?.data?.error || err.message || "Failed to fetch lab members.");
    } finally {
      setIsLoadingMembers(false);
    }
  }, [params.id]);

  const fetchLabRoles = useCallback(async () => {
    try {
      const response = await api.get('/admin/get-lab-roles');
      setAvailableLabRoles(response.data);
    } catch (err: any) {
      console.error("Failed to fetch lab roles:", err);
    }
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchLabDetails();
      fetchLabMembers();
      fetchLabRoles();
    }
  }, [params.id, fetchLabDetails, fetchLabMembers, fetchLabRoles]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive">
          <AlertCircle className="h-12 w-12 mb-2" />
          <p className="text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="relative flex flex-col items-center mb-8 lg:flex-row lg:justify-center">
        <h1 className="font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)] text-center order-1 lg:order-none">
          Manage Lab: {labDetails?.name || `ID ${params.id}`}
        </h1>
        <div className="lg:absolute lg:left-0 order-2 lg:order-none mb-2 lg:mb-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard">Admin Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Manage Lab</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Shadcn Tabs with Responsive Layout */}
      <Tabs defaultValue="details" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        {/* Responsive Tab Navigation with Scrolling */}
        <div className="w-full mb-6">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground min-w-max w-full">
              <TabsTrigger value="details" className="px-3 py-1.5 text-sm font-medium whitespace-nowrap">
                Lab Details
              </TabsTrigger>
              <TabsTrigger value="lab_roles" className="px-3 py-1.5 text-sm font-medium whitespace-nowrap">
                Lab Roles
              </TabsTrigger>
              <TabsTrigger value="members" className="px-3 py-1.5 text-sm font-medium whitespace-nowrap">
                Manage Members
              </TabsTrigger>
              <TabsTrigger value="add_members" className="px-3 py-1.5 text-sm font-medium whitespace-nowrap">
                Add Members
              </TabsTrigger>
              <TabsTrigger value="admission_requests" className="px-3 py-1.5 text-sm font-medium whitespace-nowrap">
                Admission Requests
              </TabsTrigger>
              <TabsTrigger value="inventory" className="px-3 py-1.5 text-sm font-medium whitespace-nowrap">
                Inventory
              </TabsTrigger>
              <TabsTrigger value="clock_log" className="px-3 py-1.5 text-sm font-medium whitespace-nowrap">
                Clock-in Log
              </TabsTrigger>
              <TabsTrigger value="inventory_log" className="px-3 py-1.5 text-sm font-medium whitespace-nowrap">
                Inventory Log
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Tab Content */}
        <TabsContent value="details" className="mt-0">
          <LabDetailsTab 
            labDetails={labDetails}
            onUpdate={fetchLabDetails}
            isRootAdmin={isRootAdmin}
            labId={params.id}
          />
        </TabsContent>

        <TabsContent value="lab_roles" className="mt-0">
          <LabRolesTab onRoleCreated={fetchLabRoles} />
        </TabsContent>

        <TabsContent value="members" className="mt-0">
          <ManageMembersTab 
            labMembers={labMembers}
            availableLabRoles={availableLabRoles}
            isLoadingMembers={isLoadingMembers}
            membersError={membersError}
            onMembersUpdate={fetchLabMembers}
            isRootAdmin={isRootAdmin}
            labId={params.id}
          />
        </TabsContent>

        <TabsContent value="add_members" className="mt-0">
          <AddMembersTab 
            labId={parseInt(params.id)} 
            availableLabRoles={availableLabRoles}
            onUserAdded={fetchLabMembers}
            isActive={activeTab === "add_members"}
          />
        </TabsContent>

        <TabsContent value="admission_requests" className="mt-0">
          <AdmissionRequestsTab 
            labId={parseInt(params.id)} 
            isActive={activeTab === "admission_requests"}
          />
        </TabsContent>

        <TabsContent value="inventory" className="mt-0">
          <InventoryTab 
            labId={parseInt(params.id)} 
            isActive={activeTab === "inventory"}
          />
        </TabsContent>

        <TabsContent value="clock_log" className="mt-0">
          <ClockLogTab 
            labId={parseInt(params.id)} 
            labMembers={labMembers}
            isActive={activeTab === "clock_log"}
          />
        </TabsContent>

        <TabsContent value="inventory_log" className="mt-0">
          <InventoryLogTab 
            labId={parseInt(params.id)} 
            isActive={activeTab === "inventory_log"}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}