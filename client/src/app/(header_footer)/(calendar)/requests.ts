import axios from "axios";
import { CALENDAR_ITENS_MOCK, USERS_MOCK } from "@/calendar/mocks";
import { IEvent, IEventType } from "@/calendar/interfaces";
import { format } from 'date-fns-tz';
import { 
  ApiEventType, 
  getColorForEventType, 
  transformApiEvent, 
  transformAPIUser 
} from "./transform-api-event";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Global cache for event types
let eventTypesCache: IEventType[] | null = null;

// Function to fetch event types
export const getEventTypes = async (): Promise<IEventType[]> => {
  // Return cached types if available
  if (eventTypesCache) {
    return eventTypesCache;
  }

  try {
    const response = await axios.get(`${API_URL}/calendar/getEventTypes`);
    
    if (response.status === 200) {
      // Transform API event types to our format
      const transformedTypes = response.data.map((type: ApiEventType) => ({
        id: type.id,
        name: type.name,
        color: getColorForEventType(type.id, type.name)
      }));
      
      // Cache the result
      eventTypesCache = transformedTypes;
      return transformedTypes;
    }
    
    // Fallback to default types if API call succeeds but returns non-200 status
    return getDefaultEventTypes();
  } catch (error) {
    console.error("Error fetching event types:", error);
    // Fallback to default event types if API call fails
    return getDefaultEventTypes();
  }
};

// Default event types (fallback)
const getDefaultEventTypes = (): IEventType[] => {
  return [
    { id: 1, name: "Booking", color: "blue" },
    { id: 2, name: "Meeting", color: "green" },
    { id: 3, name: "Training", color: "green" },
    { id: 4, name: "Equipment", color: "blue" },
    { id: 5, name: "Task", color: "purple" },
  ];
};

export const getEvents = async (startDate: Date, endDate: Date): Promise<IEvent[]> => {
  try {
    const start = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    const end = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        
    const response = await axios.get(
      `${API_URL}/calendar/events/1?start=${start}&end=${end}`
    );
    
    if (response.status === 200) {
      return response.data.map(transformApiEvent);
    }
    
    // Fallback to mock event data if API call succeeds but returns non-200 status
    return CALENDAR_ITENS_MOCK;
  } catch (error) {
    console.error("Error fetching events:", error);
    // Fallback to mock event data if API call fails
    return CALENDAR_ITENS_MOCK;
  }
};

export const createEvent = async (event: Partial<IEvent>): Promise<IEvent | null> => {
  try {
    // Get the type ID from the event, or default to 1
    const typeId = event.type?.id || 1;
    
    // Transform the event data to match the API's expected format
    const apiEventData = {
      labId: 1, // Fixed lab ID as specified
      memberId: parseInt(event.user?.id || "1"), // Convert string ID to number
      title: event.title,
      description: event.description,
      status: "scheduled", // Default status
      startTime: event.startDate,
      endTime: event.endDate,
      typeId: typeId,
      assignedMembers: event.assignments?.map(a => a.memberId) || []
    };
    
    const response = await axios.post(`${API_URL}/calendar/create-event`, apiEventData);
    
    if (response.status === 201) {
      return transformApiEvent(response.data);
    }
    
    return null;
  } catch (error) {
    console.error("Error creating event:", error);
    return null;
  }
};

export const updateEvent = async (event: IEvent): Promise<IEvent | null> => {
  try {
    // Get the type ID from the event, or default to 1
    const typeId = event.type?.id || 1;
    
    // Transform the event data to match the API's expected format
    const apiEventData = {
      id: event.id,
      labId: event.lab?.id || 1,
      memberId: parseInt(event.user?.id || "1"),
      title: event.title,
      description: event.description,
      status: event.status || "scheduled",
      startTime: event.startDate,
      endTime: event.endDate,
      typeId: typeId,
      instrumentId: event.instrument?.id || null,
      assignedMembers: event.assignments?.map(a => a.memberId) || []
    };
    
    const response = await axios.put(`${API_URL}/calendar/update-event`, apiEventData);
    
    if (response.status === 200) {
      return transformApiEvent(response.data);
    }
    
    return null;
  } catch (error) {
    console.error("Error updating event:", error);
    return null;
  }
};

export const deleteEvent = async (eventId: number): Promise<boolean> => {
  try {
    const response = await axios.delete(`${API_URL}/calendar/delete-event`, {
      data: { id: eventId }
    });
    
    return response.status === 200;
  } catch (error) {
    console.error("Error deleting event:", error);
    return false;
  }
};

export const getUsers = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/lab/getMembersList/1`
    );
    if (response.status === 200) {
      return response.data.map(transformAPIUser);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    // Fallback to mock user data if API call fails
    return USERS_MOCK;
  }
};

// Export color utilities
export { getColorForEventType } from "./transform-api-event";