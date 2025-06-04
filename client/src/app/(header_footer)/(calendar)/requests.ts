import axios from "axios";
import { CALENDAR_ITENS_MOCK, USERS_MOCK } from "@/calendar/mocks";
import { IEvent, IEventType, IInstrument } from "@/calendar/interfaces";
import { format } from 'date-fns-tz';
import { 
  ApiEventType, 
  getColorForEventType, 
  transformApiEvent, 
  transformAPIUser 
} from "./transform-api-event";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Global cache for event types and instruments
let eventTypesCache: IEventType[] | null = null;
let instrumentsCache: IInstrument[] | null = null;

// Function to fetch instruments
export const getInstruments = async (): Promise<IInstrument[]> => {
  // Return cached instruments if available
  if (instrumentsCache) {
    return instrumentsCache;
  }

  try {
    const response = await axios.get(`${API_URL}/calendar/get-instruments`);
    
    if (response.status === 200) {
      // Cache the result
      instrumentsCache = response.data;
      return response.data;
    }
    
    // Fallback to default instruments if API call succeeds but returns non-200 status
    return getDefaultInstruments();
  } catch (error) {
    console.error("Error fetching instruments:", error);
    // Fallback to default instruments if API call fails
    return getDefaultInstruments();
  }
};

// Default instruments (fallback)
const getDefaultInstruments = (): IInstrument[] => {
  return [
    { id: 1, name: "HPLC System 1" },
    { id: 2, name: "GC-MS System" },
    { id: 3, name: "FTIR Spectrometer" },
    { id: 4, name: "UV-Vis Spectrophotometer" },
    { id: 5, name: "XRD Diffractometer" },
    { id: 6, name: "Confocal Microscope" },
    { id: 7, name: "Flow Cytometer" },
    { id: 8, name: "PCR Machine" },
    { id: 9, name: "Centrifuge (High-Speed)" },
    { id: 10, name: "Optical Microscope" },
    { id: 11, name: "Electrochemical Analyzer" },
    { id: 12, name: "Glovebox" },
    { id: 13, name: "Rotary Evaporator" },
    { id: 14, name: "Schlenk Line" },
    { id: 15, name: "Biosafety Cabinet (Class II)" },
    { id: 16, name: "CO2 Incubator" },
    { id: 17, name: "Gel Electrophoresis System" },
    { id: 18, name: "Particle Size Analyzer" },
    { id: 19, name: "Rheometer" },
    { id: 20, name: "NMR Spectrometer (400 MHz)" },
    { id: 21, name: "Freeze Dryer" },
    { id: 22, name: "Atomic Absorption Spectrometer" }
  ];
};

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
        color: type.color || getColorForEventType(type.id, type.name) // Use DB color or fallback
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

// Default event types (fallback) - now with hex colors
const getDefaultEventTypes = (): IEventType[] => {
  return [
    { id: 1, name: "Booking", color: "#3B82F6" },     // Blue
    { id: 2, name: "Meeting", color: "#10B981" },     // Green
    { id: 3, name: "Training", color: "#10B981" },    // Green
    { id: 4, name: "Equipment", color: "#3B82F6" },   // Blue
    { id: 5, name: "Task", color: "#8B5CF6" },        // Purple
  ];
};

export const getEvents = async (startDate: Date, endDate: Date, labId?: number): Promise<IEvent[]> => {
  try {
    // Use toISOString() instead of date-fns-tz format to avoid timezone issues
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    
    // Use provided labId or default to 1 for backward compatibility
    const targetLabId = labId || 1;
        
    const response = await axios.get(
      `${API_URL}/calendar/events/${targetLabId}?start=${start}&end=${end}`
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
      labId: event.lab?.id || 1, // Use lab ID from event or default to 1
      memberId: parseInt(event.user?.id || "1"), // Convert string ID to number
      title: event.title,
      description: event.description,
      instrumentId: event.instrument?.id || null, // Include instrument ID if present
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

export const getUsers = async (labId?: number) => {
  try {
    // Use provided labId or default to 1 for backward compatibility
    const targetLabId = labId || 1;
    
    const response = await axios.get(
      `${API_URL}/lab/getMembersList/${targetLabId}`
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

export const getSingleEvent = async (eventId: number): Promise<IEvent | null> => {
  try {
    const response = await axios.get(`${API_URL}/calendar/event/${eventId}`);
    
    if (response.status === 200) {
      return transformApiEvent(response.data);
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching single event:", error);
    return null;
  }
};

// Export color utilities
export { getColorForEventType, hexToRgb, isLightColor } from "./transform-api-event";