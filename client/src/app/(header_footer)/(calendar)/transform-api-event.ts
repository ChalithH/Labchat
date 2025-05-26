import { IEvent } from "@/calendar/interfaces";
import { TEventColor } from "@/calendar/types";

// Define an interface for event types from the API
export interface ApiEventType {
  id: number;
  name: string;
}

// Map specific event types to colors
// Only "Equipment" and "Task" have specific colors, everything else uses the default green
export const eventTypeColors: Record<string, TEventColor> = {
  equipment: "blue",
  task: "purple",
  default: "green"
};

// Function to get color based on event type
export const getColorForEventType = (typeId: number, typeName: string = ""): TEventColor => {
  const normalizedName = typeName.toLowerCase();
  
  // Check for specific type mappings
  if (normalizedName.includes("equipment") || normalizedName.includes("booking")) {
    return eventTypeColors.equipment;
  }
  if (normalizedName.includes("task")) {
    return eventTypeColors.task;
  }
  
  // Return default color
  return eventTypeColors.default;
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
  // Get the color based on the event type
  const color = getColorForEventType(apiEvent.type.id, apiEvent.type.name);

  return {
    id: apiEvent.id,
    title: apiEvent.title,
    description: apiEvent.description || "",
    startDate: apiEvent.startTime,
    endDate: apiEvent.endTime,
    status: apiEvent.status,
    color,
    user: {
      id: String(apiEvent.assigner.id),
      name: apiEvent.assigner.name,
      picturePath: null,
    },
    type: {
      id: apiEvent.type.id,
      name: apiEvent.type.name
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
