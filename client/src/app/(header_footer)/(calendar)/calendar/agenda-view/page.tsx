import { getUsers, getEvents, getEventTypes, getInstruments, getEventStatuses } from "@/calendar/requests";
import { startOfMonth, endOfMonth } from 'date-fns';
import { CalendarClient } from "@/calendar/components/calendar-client";
import setUsersLastViewed from '@/lib/set_last_viewed';
import getUserFromSessionServer from "@/lib/get_user_server";
import { redirect } from "next/navigation";
import { LabProvider } from "@/contexts/lab-context";

export default async function AgendaViewPage() {
  setUsersLastViewed('/calendar/agenda-view');

  const user = await getUserFromSessionServer()

  if (!user) {
    redirect('/home')
  }

  const currentLabId = user.lastViewedLabId || 1;
  const currentDate = new Date();
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  
  // Fetch initial data on the server
  const [initialEvents, users, eventTypes, instruments, statuses] = await Promise.all([
    getEvents(startDate, endDate, currentLabId),
    getUsers(currentLabId),
    getEventTypes(),
    getInstruments(),
    getEventStatuses()
  ]);
  
  return (
    <LabProvider initialLabId={currentLabId}>
      <CalendarClient 
        view="agenda" 
        initialEvents={initialEvents} 
        users={users}
        eventTypes={eventTypes}
        instruments={instruments}
        statuses={statuses}
      />
    </LabProvider>
  );
}