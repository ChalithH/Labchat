"use client";

import { Settings } from "lucide-react";
import { CalendarProvider } from "@/calendar/contexts/calendar-context";
import { ClientContainer } from "@/calendar/components/client-container";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChangeBadgeVariantInput } from "@/calendar/components/change-badge-variant-input";
import { ChangeVisibleHoursInput } from "@/calendar/components/change-visible-hours-input";
import { ChangeWorkingHoursInput } from "@/calendar/components/change-working-hours-input";

import type { IEvent, IUser, IEventType, IInstrument } from "@/calendar/interfaces";
import type { TCalendarView } from "@/calendar/types";

interface CalendarClientProps {
  view: TCalendarView;
  initialEvents: IEvent[];
  users: IUser[];
  eventTypes: IEventType[];
  instruments: IInstrument[];
}

export function CalendarClient({ view, initialEvents, users, eventTypes, instruments }: CalendarClientProps) {
  return (
    <>
      <CalendarProvider 
        users={users} 
        eventTypes={eventTypes} 
        instruments={instruments}
        initialEvents={initialEvents}
      >
        <ClientContainer view={view} />
      </CalendarProvider>
    </>
  );
}