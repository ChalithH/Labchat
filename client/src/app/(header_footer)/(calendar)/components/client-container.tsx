// client/src/app/(header_footer)/(calendar)/components/client-container.tsx

"use client";

import { useMemo, useEffect } from "react";
import { isSameDay, parseISO } from "date-fns";
import { Loader2, AlertCircle } from "lucide-react";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useFetchEvents } from "@/calendar/hooks/use-fetch-events";

import { CalendarHeader } from "@/calendar/components/header/calendar-header";
import { CalendarMonthView } from "@/calendar/components/month-view/calendar-month-view";
import { CalendarAgendaView } from "@/calendar/components/agenda-view/calendar-agenda-view";
import { CalendarDayView } from "@/calendar/components/week-and-day-view/calendar-day-view";
import { CalendarWeekView } from "@/calendar/components/week-and-day-view/calendar-week-view";
import { Alert, AlertDescription } from "@/components/ui/alert";

import type { TCalendarView } from "@/calendar/types";

interface IProps {
  view: TCalendarView;
}

export function ClientContainer({ view }: IProps) {
  const { 
    selectedDate, 
    selectedUserId, 
    selectedTypeId, 
    selectedInstrumentId, 
    selectedStatusId,
    events 
  } = useCalendar();
  const { loading, error, setView, refreshEvents } = useFetchEvents();

  // Set the current view in our hook
  useEffect(() => {
    setView(view);
  }, [view, setView]);

  // Helper function to check if an event has a specific user assigned
  const eventHasUserAssigned = (event: any, userId: string) => {
    // If no assignments, check if the user is the assigner
    if (!event.assignments || event.assignments.length === 0) {
      return event.user.id === userId;
    }
    
    // Check if the user is in the assignments
    return event.assignments.some((assignment: any) => 
      assignment.memberId?.toString() === userId
    );
  };

  // Helper function to check if an event has a specific instrument
  const eventHasInstrument = (event: any, instrumentId: string | number) => {
    if (instrumentId === "none") {
      return !event.instrument || event.instrument === null;
    }
    return event.instrument && event.instrument.id.toString() === instrumentId.toString();
  };

  // Helper function to check if an event has a specific status
  const eventHasStatus = (event: any, statusId: string | number) => {
    if (!event.status) return false;
    return event.status.id.toString() === statusId.toString();
  };

  // Memoize event filtering for better performance
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const eventStartDate = parseISO(event.startDate);
      const eventEndDate = parseISO(event.endDate);

      // Date filtering logic - simplified since useFetchEvents already handles date ranges
      let isInDateRange = true;

      // For day view, we need additional filtering since we fetch a broader range
      if (view === "day") {
        const dayStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0);
        const dayEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59);
        isInDateRange = eventStartDate <= dayEnd && eventEndDate >= dayStart;
      }

      // User filtering logic - now checks assignments
      const isUserMatch = selectedUserId === "all" || eventHasUserAssigned(event, selectedUserId);
      
      // Type filtering
      const isTypeMatch = selectedTypeId === "all" || (event.type && event.type.id.toString() === selectedTypeId.toString());

      // Instrument filtering logic
      const isInstrumentMatch = selectedInstrumentId === "all" || eventHasInstrument(event, selectedInstrumentId);

      // Status filtering logic
      const isStatusMatch = selectedStatusId === "all" || eventHasStatus(event, selectedStatusId);

      return isInDateRange && isUserMatch && isTypeMatch && isInstrumentMatch && isStatusMatch;
    });
  }, [selectedDate, selectedUserId, selectedTypeId, selectedInstrumentId, selectedStatusId, events, view]);

  // Memoize the separation of single and multi-day events
  const { singleDayEvents, multiDayEvents } = useMemo(() => {
    const single = filteredEvents.filter(event => {
      const startDate = parseISO(event.startDate);
      const endDate = parseISO(event.endDate);
      return isSameDay(startDate, endDate);
    });

    const multi = filteredEvents.filter(event => {
      const startDate = parseISO(event.startDate);
      const endDate = parseISO(event.endDate);
      return !isSameDay(startDate, endDate);
    });

    return { singleDayEvents: single, multiDayEvents: multi };
  }, [filteredEvents]);

  // Create a refresh function that clears filters temporarily during refresh
  const handleRefresh = () => {
    refreshEvents();
  };

  return (
    <div className="overflow-hidden rounded-xl border">
      <CalendarHeader 
        view={view} 
        events={filteredEvents} 
        onRefresh={handleRefresh}
        isLoading={loading}
      />

      {loading && (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading events...</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && (
        <>
          {view === "day" && <CalendarDayView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
          {view === "month" && <CalendarMonthView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
          {view === "week" && <CalendarWeekView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
          {view === "agenda" && <CalendarAgendaView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
        </>
      )}
    </div>
  );
}