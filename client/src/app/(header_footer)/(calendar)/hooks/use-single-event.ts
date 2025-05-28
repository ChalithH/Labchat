import { useState, useEffect } from "react";
import { getSingleEvent } from "@/calendar/requests";
import type { IEvent } from "@/calendar/interfaces";

export function useSingleEvent(eventId: number) {
  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const fetchedEvent = await getSingleEvent(eventId);
        
        if (fetchedEvent) {
          setEvent(fetchedEvent);
        } else {
          setError("Event not found");
        }
      } catch (err) {
        console.error("Error fetching single event:", err);
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    if (eventId && eventId > 0) {
      fetchEvent();
    } else {
      setError("Invalid event ID");
      setLoading(false);
    }
  }, [eventId]);

  const refetchEvent = async () => {
    if (eventId && eventId > 0) {
      try {
        setError(null);
        const fetchedEvent = await getSingleEvent(eventId);
        if (fetchedEvent) {
          setEvent(fetchedEvent);
        }
      } catch (err) {
        console.error("Error refetching event:", err);
        setError("Failed to refresh event");
      }
    }
  };

  return {
    event,
    loading,
    error,
    refetchEvent,
    setEvent
  };
}
