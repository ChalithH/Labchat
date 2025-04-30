import { useCalendar } from "@/calendar/contexts/calendar-context";
import type { IEvent } from "@/calendar/interfaces";

export function useAddEvent() {
  const { setLocalEvents } = useCalendar();

  // This is just an example, in a real scenario
  // you would call an API to add the event
  const addEvent = (eventData: Omit<IEvent, "id">) => {
    const newEvent: IEvent = {
      id: Date.now(), // Generate a unique ID for the new event
      ...eventData
    };

    setLocalEvents(prev => [...prev, newEvent]);
  };

  return { addEvent };
}