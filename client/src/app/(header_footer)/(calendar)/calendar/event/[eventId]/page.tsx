import { notFound, redirect } from 'next/navigation';
import { getSingleEvent, getUsers, getEventTypes, getInstruments, getEventStatuses } from "@/calendar/requests";
import { SingleEventClient } from "@/calendar/components/single-event/single-event-client";
import setUsersLastViewed from '@/lib/set_last_viewed';
import getUserFromSessionServer from '@/lib/get_user_server';
import { transformLabMember } from '../../../transform-api-event';
import getLabMember from '@/lib/get_lab_member';

type Params = Promise<{ eventId: string }>

export default async function SingleEventPage(props:{ params: Params}) {
  const params = await props.params

  setUsersLastViewed('/calendar/agenda-view');

  const user = await getUserFromSessionServer()

  if (!user) {
    redirect('/home')
  }

  const currentLabId = user.lastViewedLabId || 1;
  const eventId = parseInt( await params.eventId, 10);
  
  const labMember = await getLabMember(Number(user.id), Number(currentLabId));

  // Validate event ID
  if (isNaN(eventId) || eventId <= 0) {
    notFound();
  }



  try {
    // Fetch event and supporting data in parallel
    const [event, users, eventTypes, instruments, statuses, currentUser] = await Promise.all([
      getSingleEvent(eventId),
      getUsers(),
      getEventTypes(),
      getInstruments(),
      getEventStatuses(),
      transformLabMember(labMember, currentLabId)
    ]);

    // If event doesn't exist, show 404
    if (!event) {
      notFound();
    }

    return (
      <SingleEventClient 
        event={event}
        users={users}
        eventTypes={eventTypes}
        instruments={instruments}
        statuses={statuses}
        currentUser={currentUser}
      />
    );
  } catch (error) {
    console.error("Error loading single event page:", error);
    notFound();
  }
}
