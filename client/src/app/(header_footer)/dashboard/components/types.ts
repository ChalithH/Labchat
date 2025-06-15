export interface Announcement {
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  authorImage?: string;
}

export interface Member {
  id?: number;
  memberID: number;
  name: string;
  role: string;
  image?: string;
  statusName: string;
  permissionLevel: number;
  clockIn: string;
  status: Array<{
    id: number;
    status: {
      id: number;
      statusName: string;
      statusWeight: number;
    };
    isActive: boolean;
    contactType?: string;
    contactInfo?: string;
    contactName?: string;
    description?: string;
  }>;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  labAttendance?: any[];
  isPCI?: boolean;
}

export interface Job {
  name: string;
  time: string;
}

export interface InventoryItem {
  name: string;
  remaining: number;
  minStock: number;
  tags?: { name: string; description?: string }[];
}