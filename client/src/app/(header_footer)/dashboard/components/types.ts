export interface Announcement {
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  authorImage?: string;
}

export interface Member {
  memberID: number;
  name: string;
  role: string;
  image?: string;
  statusName: string;
  permissionLevel: number;
  clockIn: string;
  status: Array<{
    status: {
      id: number;
      statusName: string;
      statusWeight: number;
    };
    isActive: boolean;
    contactType?: string;
    contactInfo?: string;
    contactName?: string;
  }>;
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