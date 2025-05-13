import { getUsers, getEvents } from "@/calendar/requests";
import { startOfMonth, endOfMonth } from 'date-fns';
import { CalendarClient } from "@/calendar/components/calendar-client";

export default async function AgendaViewPage() {
  const currentDate = new Date();
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  
  // Fetch initial data on the server
  const [initialEvents, users] = await Promise.all([
    getEvents(startDate, endDate),
    getUsers()
  ]);
  
  return (
    <CalendarClient 
      view="agenda" 
      initialEvents={initialEvents} 
      users={users} 
    />
  );
}