import { getUsers, getEvents, getEventTypes } from "@/calendar/requests";
import { startOfMonth, endOfMonth } from 'date-fns';
import { CalendarClient } from "@/calendar/components/calendar-client";
import setUsersLastViewed from '@/lib/set_last_viewed';
import getUserFromSessionServer from "@/lib/get_user_server";
import { redirect } from "next/navigation";
import { LabProvider } from "@/contexts/lab-context";

export default async function MonthViewPage() {
  setUsersLastViewed('/calendar/month-view');

  const user = await getUserFromSessionServer()

  if (!user) {
    redirect('/home')
  }

  const currentLabId = user.lastViewedLabId || 1;
  const currentDate = new Date();
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  
  // Fetch initial data on the server with the user's current lab
  const [initialEvents, users, eventTypes] = await Promise.all([
    getEvents(startDate, endDate, currentLabId),
    getUsers(currentLabId),
    getEventTypes()
  ]);
  
  return (
    <LabProvider initialLabId={currentLabId}>
      <CalendarClient 
        view="month" 
        initialEvents={initialEvents} 
        users={users}
        eventTypes={eventTypes}
      />
    </LabProvider>
  );
}