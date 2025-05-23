import { getUsers, getEvents } from "@/calendar/requests";
import { startOfWeek, endOfWeek } from 'date-fns';
import { CalendarClient } from "@/calendar/components/calendar-client";
import setUsersLastViewed from '@/lib/set_last_viewed';

export default async function WeekViewPage() {
  setUsersLastViewed('/calendar/week-view');

  const currentDate = new Date();
  const startDate = startOfWeek(currentDate);
  const endDate = endOfWeek(currentDate);
  
  // Fetch initial data on the server
  const [initialEvents, users] = await Promise.all([
    getEvents(startDate, endDate),
    getUsers()
  ]);
  
  return (
    <CalendarClient 
      view="week" 
      initialEvents={initialEvents} 
      users={users} 
    />
  );
}