export interface InventoryLogEntry {
  id: number;
  action: InventoryAction;
  source: InventorySource;
  quantityChanged: number | null;
  reason: string | null;
  createdAt: string;
  previousValues: any;
  newValues: any;
  labInventoryItem: {
    id: number;
    location: string;
    itemUnit: string;
    currentStock: number;
    minStock: number;
    item: {
      id: number;
      name: string;
      description: string | null;
    };
  } | null;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    displayName: string;
  };
  member: {
    id: number;
    user: {
      firstName: string;
      lastName: string;
      displayName: string;
    };
  } | null;
}

export enum InventoryAction {
  STOCK_ADD = 'STOCK_ADD',
  STOCK_REMOVE = 'STOCK_REMOVE',
  STOCK_UPDATE = 'STOCK_UPDATE',
  LOCATION_CHANGE = 'LOCATION_CHANGE',
  MIN_STOCK_UPDATE = 'MIN_STOCK_UPDATE',
  ITEM_ADDED = 'ITEM_ADDED',
  ITEM_REMOVED = 'ITEM_REMOVED',
  ITEM_UPDATE = 'ITEM_UPDATE'
}

export enum InventorySource {
  ADMIN_PANEL = 'ADMIN_PANEL',
  LAB_INTERFACE = 'LAB_INTERFACE',
  API_DIRECT = 'API_DIRECT',
  BULK_IMPORT = 'BULK_IMPORT'
}

export interface InventoryLogResponse {
  logs: InventoryLogEntry[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface InventoryLogFilters {
  action: string;
  source: string;
  startDate: string;
  endDate: string;
  userId: string;
  memberId: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  displayName: string;
}

export interface Member {
  id: number;
  user: User;
} 