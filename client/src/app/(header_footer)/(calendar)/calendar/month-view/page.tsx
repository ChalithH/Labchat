import { getUsers, getEvents } from "@/calendar/requests";
import { startOfMonth, endOfMonth } from 'date-fns';
import { CalendarClient } from "@/calendar/components/calendar-client";
import setUsersLastViewed from '@/lib/set_last_viewed';

export default async function MonthViewPage() {
  setUsersLastViewed('/calendar/month-view');

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
      view="month" 
      initialEvents={initialEvents} 
      users={users} 
    />
  );
}