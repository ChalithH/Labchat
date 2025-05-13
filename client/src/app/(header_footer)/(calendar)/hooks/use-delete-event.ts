import { useState } from "react";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { deleteEvent } from "@/calendar/requests";

export function useDeleteEvent() {
  const { setLocalEvents } = useCalendar();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeEvent = async (eventId: number) => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const success = await deleteEvent(eventId);
      
      if (success) {
        setLocalEvents(prev => prev.filter(event => event.id !== eventId));
        return true;
      } else {
        setError("Failed to delete event");
        return false;
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("An error occurred while deleting the event");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { removeEvent, isDeleting, error };
}