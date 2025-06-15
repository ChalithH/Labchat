export interface LabDetails {
  id: number;
  name: string;
  location: string;
  status: string;
}

export interface UserData {
  id: number;
  firstName?: string;
  lastName?: string;
  displayName: string;
  jobTitle?: string;
  office?: string | null;
  bio?: string | null;
}

export interface LabRoleData {
  id: number;
  name: string;
  permissionLevel: number;
  description?: string;
}

export interface ContactInMemberStatus {
  id: number;
  type: string;
  info: string;
  useCase?: string | null;
  name: string;
}

export interface GlobalStatusInMemberStatus {
  id: number;
  statusName: string;
  statusWeight: number;
}

export interface MemberStatusEntry {
  id: number; 
  contactId: number;
  statusId: number;
  isActive: boolean;
  description: string | null;
  contact: ContactInMemberStatus; 
  status: GlobalStatusInMemberStatus;
}

export interface LabMemberData extends UserData {
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

export interface GlobalStatusType {
  id: number; 
  statusName: string;
}

export interface UserContact {
  id: number;
  type: string;
  info: string;
  useCase?: string | null;
  name: string;
}

export interface AttendanceLog {
  id: number;
  memberId: number;
  memberName: string;
  memberRole: string;
  clockIn: string;
  clockOut: string | null;
  duration: number | null;
  isActive: boolean;
}

export interface AttendancePagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}