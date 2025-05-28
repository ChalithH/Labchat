import { getUsers, getEvents, getEventTypes, getInstruments } from "@/calendar/requests";
import { startOfDay, endOfDay } from 'date-fns';
import { CalendarClient } from "@/calendar/components/calendar-client";
import setUsersLastViewed from '@/lib/set_last_viewed';
import getUserFromSessionServer from "@/lib/get_user_server";
import { redirect } from "next/navigation";

export default async function DayViewPage() {
  setUsersLastViewed('/calendar/day-view');
    const user = await getUserFromSessionServer()

  if (!user) {
    redirect('/home')
  }

  const currentDate = new Date();
  const startDate = startOfDay(currentDate);
  const endDate = endOfDay(currentDate);
  
  // Fetch initial data on the server
  const [initialEvents, users, eventTypes, instruments] = await Promise.all([
    getEvents(startDate, endDate),
    getUsers(),
    getEventTypes(),
    getInstruments()
  ]);
  
  return (
    <CalendarClient 
      view="day" 
      initialEvents={initialEvents} 
      users={users}
      eventTypes={eventTypes}
      instruments={instruments}
    />
  );
}