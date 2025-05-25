export interface AdmissionRequest {
  id: number;
  labId: number;
  userId: number;
  roleId: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string;
    lastName: string;
    displayName: string;
    jobTitle?: string;
    office?: string;
  };
  role?: {
    name: string;
    description?: string;
  } | null;
  lab: {
    name: string;
    location: string;
  };
}

export interface LabRole {
  id: number;
  name: string;
  description?: string;
  permissionLevel?: number;
}

export interface Lab {
  id: number;
  name: string;
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserLabStatus {
  labId: number;
  isMember: boolean;
  hasPendingRequest: boolean;
  hasApprovedRequest: boolean;
  requestStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
}

export interface LabWithStatus extends Lab {
  userStatus: {
    isMember: boolean;
    hasPendingRequest: boolean;
    hasApprovedRequest: boolean;
    requestStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  };
}