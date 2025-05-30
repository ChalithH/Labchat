export interface GlobalItem {
  id: number;
  name: string;
  description: string | null;
  safetyInfo: string | null;
  approval: boolean;
}

export interface ItemTag {
  id: number;
  name: string;
  description: string | null;
}

export interface LabInventoryItem {
  id: number;
  labId: number;
  location: string;
  itemUnit: string;
  currentStock: number;
  minStock: number;
  updatedAt: string;
  item: GlobalItem;
  itemTags: ItemTag[];
}

export interface CreateLabInventoryItemRequest {
  itemId: number;
  location: string;
  itemUnit: string;
  currentStock: number;
  minStock: number;
  tagIds?: number[];
}

export interface UpdateLabInventoryItemRequest {
  location?: string;
  itemUnit?: string;
  currentStock?: number;
  minStock?: number;
}

export interface CreateTagRequest {
  name: string;
  tagDescription?: string;
}

export interface UpdateTagRequest {
  name?: string;
  tagDescription?: string;
} 