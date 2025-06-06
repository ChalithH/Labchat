import { notFound } from 'next/navigation';
import { getSingleEvent, getUsers, getEventTypes, getInstruments, getEventStatuses } from "@/calendar/requests";
import { SingleEventClient } from "@/calendar/components/single-event/single-event-client";

type Params = Promise<{ eventId: string }>

export default async function SingleEventPage(props:{ params: Params}) {
const params = await props.params
  const eventId = parseInt( await params.eventId, 10);
  
  // Validate event ID
  if (isNaN(eventId) || eventId <= 0) {
    notFound();
  }

  try {
    // Fetch event and supporting data in parallel
    const [event, users, eventTypes, instruments, statuses] = await Promise.all([
      getSingleEvent(eventId),
      getUsers(),
      getEventTypes(),
      getInstruments(),
      getEventStatuses()
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
      />
    );
  } catch (error) {
    console.error("Error loading single event page:", error);
    notFound();
  }
}
