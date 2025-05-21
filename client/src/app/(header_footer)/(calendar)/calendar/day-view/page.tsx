import { getUsers, getEvents, getEventTypes } from "@/calendar/requests";
import { startOfDay, endOfDay } from 'date-fns';
import { CalendarClient } from "@/calendar/components/calendar-client";

export default async function DayViewPage() {
  const currentDate = new Date();
  const startDate = startOfDay(currentDate);
  const endDate = endOfDay(currentDate);
  
  // Fetch initial data on the server
  const [initialEvents, users, eventTypes] = await Promise.all([
    getEvents(startDate, endDate),
    getUsers(),
    getEventTypes()
  ]);
  
  return (
    <CalendarClient 
      view="day" 
      initialEvents={initialEvents} 
      users={users}
      eventTypes={eventTypes}
    />
  );
}