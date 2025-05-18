import { getUsers, getEvents, getEventTypes } from "@/calendar/requests";
import { startOfMonth, endOfMonth } from 'date-fns';
import { CalendarClient } from "@/calendar/components/calendar-client";

export default async function MonthViewPage() {
  const currentDate = new Date();
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  
  // Fetch initial data on the server
  const [initialEvents, users, eventTypes] = await Promise.all([
    getEvents(startDate, endDate),
    getUsers(),
    getEventTypes()
  ]);
  
  return (
    <CalendarClient 
      view="month" 
      initialEvents={initialEvents} 
      users={users}
      eventTypes={eventTypes}
    />
  );
}