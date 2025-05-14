export interface Announcement {
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  authorImage?: string;
}

export interface Member {
  name: string;
  title: string;
  image?: string;
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