export interface Announcement {
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  authorImage?: string;
}

export interface Member {
  name: string;
  role: string;
  image?: string;
  statusName: string;
  permissionLevel: number;
  clockIn: string;
}

export interface Job {
  name: string;
  time: string;
}

export interface InventoryItem {
  name: string;
  remaining: number;
  minStock: number;
}