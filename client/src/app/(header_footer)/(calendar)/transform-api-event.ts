import { IEvent } from "@/calendar/interfaces";
import { TEventColor } from "@/calendar/types";

// Map event types to colors for consistency
export const eventTypeColors: Record<string, TEventColor> = {
  rostering: "blue",
  equipment: "green",
  default: "purple",
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
  // Determine the color based on event type
  const typeName = apiEvent.type?.name?.toLowerCase() || "";
  let color: TEventColor = eventTypeColors.default;
  
  if (typeName.includes("rostering") || typeName === "rostering") {
    color = eventTypeColors.rostering;
  } else if (typeName.includes("equipment") || typeName === "equipment") {
    color = eventTypeColors.equipment;
  }

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
}