import { getUsers, getEvents, getEventTypes } from "@/calendar/requests";
import { startOfWeek, endOfWeek } from 'date-fns';
import { CalendarClient } from "@/calendar/components/calendar-client";

export default async function WeekViewPage() {
  const currentDate = new Date();
  const startDate = startOfWeek(currentDate);
  const endDate = endOfWeek(currentDate);
  
  // Fetch initial data on the server
  const [initialEvents, users, eventTypes] = await Promise.all([
    getEvents(startDate, endDate),
    getUsers(),
    getEventTypes()
  ]);
  
  return (
    <CalendarClient 
      view="week" 
      initialEvents={initialEvents} 
      users={users}
      eventTypes={eventTypes}
    />
  );
}