"use client";
import { CalendarProvider } from "@/calendar/contexts/calendar-context";
import { ClientContainer } from "@/calendar/components/client-container";
import type { IEvent, IUser, IEventType, IInstrument, IEventStatus, ILabMember } from "@/calendar/interfaces";
import type { TCalendarView } from "@/calendar/types";

interface CalendarClientProps {
  view: TCalendarView;
  initialEvents: IEvent[];
  users: IUser[];
  eventTypes: IEventType[];
  instruments: IInstrument[];
  statuses: IEventStatus[];
  currentUser: ILabMember;
}

export function CalendarClient({ view, 
  initialEvents, 
  users, 
  eventTypes, 
  instruments, 
  statuses,
  currentUser
}: CalendarClientProps) {
  return (
    <>
      <CalendarProvider 
        users={users} 
        eventTypes={eventTypes} 
        instruments={instruments}
        statuses={statuses}
        initialEvents={initialEvents}
        currentUser={currentUser}
      >
        <ClientContainer view={view} />
      </CalendarProvider>
    </>
  );
}