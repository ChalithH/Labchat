import { useState } from "react";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useCurrentLabId } from "@/contexts/lab-context";
import { createEvent } from "@/calendar/requests";

import type { IEvent } from "@/calendar/interfaces";

export function useAddEvent() {
  const { setLocalEvents, currentUser } = useCalendar();
  const currentLabId = useCurrentLabId();
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addEvent = async (eventData: Partial<IEvent>) => {
    setIsAdding(true);
    setError(null);
    
    try {
      const eventWithLabId = {
        ...eventData,
        lab: { 
          id: currentLabId,
          name: `Lab ${currentLabId}`
        },
      };
      
      const newEvent = await createEvent(eventWithLabId, currentUser);
      
      if (newEvent) {
        setLocalEvents(prev => [...prev, newEvent]);
        return true;
      } else {
        setError("Failed to create event");
        return false;
      }
    } catch (err) {
      console.error("Error creating event:", err);
      setError("An error occurred while creating the event");
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  return { addEvent, isAdding, error };
}