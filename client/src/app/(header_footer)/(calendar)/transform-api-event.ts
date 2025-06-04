import { IEvent } from "@/calendar/interfaces";

// Define an interface for event types from the API
export interface ApiEventType {
  id: number;
  name: string;
  color?: string; // Now optional hex color from DB
}

// Default colors as fallback if no color is set in the database
export const defaultEventTypeColors: Record<string, string> = {
  equipment: "#3B82F6", // Blue
  booking: "#3B82F6",   // Blue
  task: "#8B5CF6",      // Purple
  meeting: "#10B981",   // Green
  training: "#10B981",  // Green
  default: "#10B981"    // Green
};

// Function to get color based on event type
export const getColorForEventType = (typeId: number, typeName: string = "", dbColor?: string): string => {
  // If color is stored in database, use it
  if (dbColor) {
    return dbColor;
  }
  
  const normalizedName = typeName.toLowerCase();
  
  // Check for specific type mappings
  if (normalizedName.includes("equipment") || normalizedName.includes("booking")) {
    return defaultEventTypeColors.equipment;
  }
  if (normalizedName.includes("task")) {
    return defaultEventTypeColors.task;
  }
  if (normalizedName.includes("meeting")) {
    return defaultEventTypeColors.meeting;
  }
  if (normalizedName.includes("training")) {
    return defaultEventTypeColors.training;
  }
  
  // Return default color
  return defaultEventTypeColors.default;
};

// API Event interface that matches the backend response
export interface ApiEvent {
  id: number;
  labId: number;
  memberId: number;
  instrumentId: number | null;
  title: string;
  description: string | null;
  status: string | null;
  startTime: string;
  endTime: string;
  updatedAt: string;
  type: {
    id: number;
    name: string;
    color?: string; 
  };
  lab: {
    id: number;
    name: string;
  };
  assigner: {
    id: number;
    name: string;
  };
  instrument: {
    id: number;
    name: string | null;
  } | null;
  eventAssignments: {
    id: number;
    memberId?: number;
    name: string;
  }[];
}

// User interface from API
export interface ApiUser {
  id: number;
  name: string;
  labId: number;
  memberID: number;
  displayName: string;
  firstName: string;
  lastName: string;
}

// Transform API event format to our application event format
export const transformApiEvent = (apiEvent: ApiEvent): IEvent => {
  // Get the color based on the event type - use DB color if available, otherwise fallback
  const color = getColorForEventType(apiEvent.type.id, apiEvent.type.name, apiEvent.type.color);

  return {
    id: apiEvent.id,
    title: apiEvent.title,
    description: apiEvent.description || "",
    startDate: apiEvent.startTime,
    endDate: apiEvent.endTime,
    status: apiEvent.status,
    color, // Now a hex color code
    user: {
      id: String(apiEvent.assigner.id),
      name: apiEvent.assigner.name,
      picturePath: null,
    },
    type: {
      id: apiEvent.type.id,
      name: apiEvent.type.name,
      color: apiEvent.type.color // Store the hex color
    },
    instrument: apiEvent.instrument,
    lab: apiEvent.lab,
    assignments: apiEvent.eventAssignments,
  };
};

// Transform API user to our application user format
export const transformAPIUser = (apiUser: ApiUser): IEvent["user"] => {
  return {
    id: String(apiUser.memberID),
    name: apiUser.displayName,
    picturePath: null,
  };
};

// Utility function to convert hex to RGB for dynamic styling
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Utility function to determine if a color is light or dark (for text contrast)
export const isLightColor = (hex: string): boolean => {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
};