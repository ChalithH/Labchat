"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from "sonner";
import api from '@/lib/api';
import { RoleSelect } from './role-select';
import { PciUserCheckbox } from './pci-user-checkbox';

interface User {
  id: number;
  displayName: string;
  jobTitle?: string;
  profilePic?: string | null;
}

interface Lab {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

interface AdmissionRequest {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  isPCI?: boolean | null;
  roleId?: number;
  createdAt: string;
  user: User;
  lab: Lab;
  role?: Role;
  profilePic?: string | null;
}

interface LabRole {
  id: number;
  name: string;
  permissionLevel: number;
}

interface AdmissionTableProps {
  labId: number;
  searchQuery: string;
  statusFilter: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'withdrawn':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

export default function AdmissionTable({ labId, searchQuery, statusFilter }: AdmissionTableProps) {
  const [requests, setRequests] = useState<AdmissionRequest[]>([]);
  const [labRoles, setLabRoles] = useState<LabRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<{ [key: number]: number | null }>({});
  const [selectedPciUsers, setSelectedPciUsers] = useState<{ [key: number]: boolean | null }>({});

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/labAdmission/lab/${labId}`);
        const requestsData = response.data;
        setRequests(requestsData);

        // Initialize selected roles and PCI users from existing data
        const initialSelectedRoles: { [key: number]: number | null } = {};
        const initialSelectedPciUsers: { [key: number]: boolean | null } = {};

        requestsData.forEach((request: AdmissionRequest) => {
          initialSelectedRoles[request.id] = request.roleId || null;
          initialSelectedPciUsers[request.id] = request.isPCI ?? null;
        });

        setSelectedRoles(initialSelectedRoles);
        setSelectedPciUsers(initialSelectedPciUsers);
      } catch (err: any) {
        console.error('Failed to fetch admission requests:', err);
        setError('Failed to load admission requests. Please try again later.');
        toast.error('Failed to load admission requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [labId]);

  useEffect(() => {
    const fetchLabRoles = async () => {
      try {
        const response = await api.get('/admin/get-lab-roles');
        setLabRoles(response.data);
      } catch (err: any) {
        console.error('Failed to fetch lab roles:', err);
        toast.error('Failed to load lab roles');
      }
    };

    fetchLabRoles();
  }, []);

  const handleRoleChange = (requestId: number, roleId: number | null) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [requestId]: roleId
    }));
  };

  const handlePciUserChange = (requestId: number, pciUser: boolean | null) => {
    setSelectedPciUsers((prev) => ({
      ...prev,
      [requestId]: pciUser,
    }));
  };

  const handleApprove = async (requestId: number, roleId: number, pciUser?: boolean) => {
    setProcessingId(requestId);
    try {
      const payload = {
        roleId: roleId,
        isPCI: pciUser ?? selectedPciUsers[requestId] ?? false
      };

      await api.put(`/labAdmission/approve/${requestId}`, payload);

      // Update local state
      setRequests((prev) =>
        prev.map((req) => 
          req.id === requestId 
            ? { ...req, status: 'APPROVED' as const, roleId, isPCI: payload.isPCI }
            : req
        )
      );

      // Clear selections for this request
      setSelectedRoles((prev) => ({
        ...prev,
        [requestId]: null
      }));

      setSelectedPciUsers((prev) => ({
        ...prev,
        [requestId]: null
      }));

      toast.success('Admission request approved successfully');
    } catch (err: any) {
      console.error('Failed to approve request:', err);
      toast.error(err.response?.data?.error || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: number) => {
    setProcessingId(requestId);
    try {
      await api.put(`/labAdmission/reject/${requestId}`);

      // Update local state
      setRequests((prev) => 
        prev.map((req) => 
          req.id === requestId 
            ? { ...req, status: 'REJECTED' as const }
            : req
        )
      );

      toast.success('Admission request rejected');
    } catch (err: any) {
      console.error('Failed to reject request:', err);
      toast.error(err.response?.data?.error || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.lab.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Update filter logic to handle 'all' case
    const matchesStatus = statusFilter === 'all' || request.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const sortedRequests = filteredRequests.sort((a, b) => {
    // Pending requests first
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    // Then by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getPciUserDisplay = (pciUser?: boolean | null) => {
    if (pciUser === true) {
      return <span className="text-green-700 font-medium">✓ Yes</span>;
    }
    if (pciUser === false) {
      return <span className="text-red-700 font-medium">✗ No</span>;
    }
    return <span className="text-gray-500">— Not Set</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading admission requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Mobile view */}
      <div className="lg:hidden divide-y">
        {sortedRequests.map((request) => (
          <div key={request.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={request.user.profilePic ?? undefined} alt={request.user.displayName} />
                  <AvatarFallback>{getInitials(request.user.displayName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{request.user.displayName}</p>
                  {request.user.jobTitle && (
                    <p className="text-sm text-gray-500">{request.user.jobTitle}</p>
                  )}
                </div>
              </div>
              <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <p>
                <span className="font-medium">Requested Role:</span> {request.role ? request.role.name : "Not specified"}
              </p>
              <p>
                <span className="font-medium">PCI User:</span> {getPciUserDisplay(request.isPCI)}
              </p>
              <p>
                <span className="font-medium">Date Requested:</span> {formatDate(request.createdAt)}
              </p>
            </div>

            {request.status === 'PENDING' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Approve as Role:</label>
                  <RoleSelect
                    roles={labRoles}
                    value={selectedRoles[request.id] || null}
                    onValueChange={(roleId) => handleRoleChange(request.id, roleId)}
                    placeholder="Select role to approve..."
                    disabled={processingId === request.id}
                    className="w-full"
                  />
                </div>

                <div>
                  <PciUserCheckbox
                    value={selectedPciUsers[request.id] ?? null}
                    onValueChange={(value) => handlePciUserChange(request.id, value)}
                    disabled={processingId === request.id}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    className="flex-1"
                    onClick={() => selectedRoles[request.id] && handleApprove(request.id, selectedRoles[request.id]!, selectedPciUsers[request.id] ?? undefined)}
                    disabled={!selectedRoles[request.id] || processingId === request.id}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {processingId === request.id ? "Processing..." : "Approve"}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(request.id)}
                    disabled={processingId === request.id}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {request.status !== 'PENDING' && (
              <div className="text-sm text-gray-500">
                No actions available for {request.status.toLowerCase()} requests
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop view */}
      <div className="hidden lg:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applicant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Approve as Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PIC User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Requested
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={request.user.profilePic ?? undefined} alt={request.user.displayName} />
                      <AvatarFallback>{getInitials(request.user.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{request.user.displayName}</div>
                      {request.user.jobTitle && (
                        <div className="text-sm text-gray-500">{request.user.jobTitle}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {request.status === 'PENDING' ? (
                    <RoleSelect
                      roles={labRoles}
                      value={selectedRoles[request.id] || null}
                      onValueChange={(roleId) => handleRoleChange(request.id, roleId)}
                      placeholder="Select role..."
                      disabled={processingId === request.id}
                    />
                  ) : (
                    <span className="text-sm text-gray-900">
                      {request.role ? request.role.name : "Not specified"}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {request.status === 'PENDING' ? (
                    <PciUserCheckbox
                      value={selectedPciUsers[request.id] ?? null}
                      onValueChange={(value) => handlePciUserChange(request.id, value)}
                      disabled={processingId === request.id}
                      label=""
                    />
                  ) : (
                    <span className="text-sm">{getPciUserDisplay(request.isPCI)}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(request.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {request.status === 'PENDING' ? (
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => selectedRoles[request.id] && handleApprove(request.id, selectedRoles[request.id]!, selectedPciUsers[request.id] ?? undefined)}
                        disabled={!selectedRoles[request.id] || processingId === request.id}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleReject(request.id)} 
                        disabled={processingId === request.id}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-gray-400">No actions available</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedRequests.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchQuery || statusFilter !== 'all' ? 
            'No admission requests match your filters.' : 
            'No admission requests found.'
          }
        </div>
      )}
    </div>
  );
}