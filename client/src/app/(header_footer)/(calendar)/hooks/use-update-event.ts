import { useState } from "react";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { updateEvent as apiUpdateEvent } from "@/calendar/requests";

import type { IEvent } from "@/calendar/interfaces";

export function useUpdateEvent() {
  const { setLocalEvents } = useCalendar();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateEvent = async (event: IEvent) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const updatedEvent = await apiUpdateEvent(event);
      
      if (updatedEvent) {
        setLocalEvents(prev => {
          const index = prev.findIndex(e => e.id === event.id);
          if (index === -1) return prev;
          return [...prev.slice(0, index), updatedEvent, ...prev.slice(index + 1)];
        });
        return true;
      } else {
        setError("Failed to update event");
        return false;
      }
    } catch (err) {
      console.error("Error updating event:", err);
      setError("An error occurred while updating the event");
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateEvent, isUpdating, error };
}