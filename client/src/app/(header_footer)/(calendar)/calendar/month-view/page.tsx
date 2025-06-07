import { getUsers, getEvents, getEventTypes, getInstruments, getEventStatuses } from "@/calendar/requests";
import { startOfMonth, endOfMonth } from 'date-fns';
import { CalendarClient } from "@/calendar/components/calendar-client";
import setUsersLastViewed from '@/lib/set_last_viewed';
import getUserFromSessionServer from "@/lib/get_user_server";
import { redirect } from "next/navigation";
import { LabProvider } from "@/contexts/lab-context";
import { transformLabMember } from "../../transform-api-event";
import getLabMember from "@/lib/get_lab_member";

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

  const labMember = await getLabMember(Number(user.id), Number(currentLabId));

  // Fetch initial data on the server
  const [initialEvents, users, eventTypes, instruments, statuses, currentUser] = await Promise.all([
    getEvents(startDate, endDate, currentLabId),
    getUsers(currentLabId),
    getEventTypes(),
    getInstruments(),
    getEventStatuses(),
    transformLabMember(labMember, currentLabId)
  ]);
  
  return (
    <LabProvider initialLabId={currentLabId}>
      <CalendarClient 
        view="month" 
        initialEvents={initialEvents} 
        users={users}
        eventTypes={eventTypes}
        instruments={instruments}
        statuses={statuses}
        currentUser={currentUser}
      />
    </LabProvider>
  );
}