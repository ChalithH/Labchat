"use client";

import { Settings } from "lucide-react";
import { CalendarProvider } from "@/calendar/contexts/calendar-context";
import { ClientContainer } from "@/calendar/components/client-container";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChangeBadgeVariantInput } from "@/calendar/components/change-badge-variant-input";
import { ChangeVisibleHoursInput } from "@/calendar/components/change-visible-hours-input";
import { ChangeWorkingHoursInput } from "@/calendar/components/change-working-hours-input";

import type { IEvent, IUser, IEventType } from "@/calendar/interfaces";
import type { TCalendarView } from "@/calendar/types";

interface CalendarClientProps {
  view: TCalendarView;
  initialEvents: IEvent[];
  users: IUser[];
  eventTypes: IEventType[];
}

export function CalendarClient({ view, initialEvents, users, eventTypes }: CalendarClientProps) {
  return (
    <>
      <CalendarProvider users={users} eventTypes={eventTypes} initialEvents={initialEvents}>
        <ClientContainer view={view} />
        
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="flex-none gap-2 py-0 hover:no-underline">
              <div className="flex items-center gap-2">
                <Settings className="size-4" />
                <p className="text-base font-semibold">Calendar settings</p>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className="mt-4 flex flex-col gap-6">
                <ChangeBadgeVariantInput />
                <ChangeVisibleHoursInput />
                <ChangeWorkingHoursInput />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CalendarProvider>
    </>
  );
}