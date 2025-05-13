import axios from "axios";
import { CALENDAR_ITENS_MOCK, USERS_MOCK } from "@/calendar/mocks";
import { IEvent } from "@/calendar/interfaces";
import { format } from 'date-fns-tz';
import { eventTypeColors, transformApiEvent, transformAPIUser } from "./transform-api-event";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
    // Determine the event type based on color
    const eventType = Object.entries(eventTypeColors).find(([, color]) => color === event.color)?.[0] || "default";
    
    // Transform the event data to match the API's expected format
    const apiEventData = {
      labId: 1, // Fixed lab ID as specified
      memberId: parseInt(event.user?.id || "1"), // Convert string ID to number
      title: event.title,
      description: event.description,
      status: "scheduled", // Default status
      startTime: event.startDate,
      endTime: event.endDate,
      typeId: eventType === "equipment" ? 2 : 1, // Default to rostering(1) or equipment(2)
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
    // Determine the event type based on color
    const eventType = Object.entries(eventTypeColors).find(([, color]) => color === event.color)?.[0] || "default";
    
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
      typeId: eventType === "equipment" ? 2 : 1,
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

// Re-export eventTypeColors from transform-api-event
export { eventTypeColors } from "./transform-api-event";