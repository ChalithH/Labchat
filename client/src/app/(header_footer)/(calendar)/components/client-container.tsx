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
  const { selectedDate, selectedUserId, selectedTypeId, events } = useCalendar();
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

  // Memoize event filtering for better performance
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const eventStartDate = parseISO(event.startDate);
      const eventEndDate = parseISO(event.endDate);

      // Date filtering logic remains the same
      let isInDateRange = false;

      if (view === "year") {
        const yearStart = new Date(selectedDate.getFullYear(), 0, 1);
        const yearEnd = new Date(selectedDate.getFullYear(), 11, 31, 23, 59, 59, 999);
        isInDateRange = eventStartDate <= yearEnd && eventEndDate >= yearStart;
      } else if (view === "month" || view === "agenda") {
        const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);
        isInDateRange = eventStartDate <= monthEnd && eventEndDate >= monthStart;
      } else if (view === "week") {
        const dayOfWeek = selectedDate.getDay();
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        isInDateRange = eventStartDate <= weekEnd && eventEndDate >= weekStart;
      } else if (view === "day") {
        const dayStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0);
        const dayEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59);
        isInDateRange = eventStartDate <= dayEnd && eventEndDate >= dayStart;
      }

      // Updated user filtering logic - now checks assignments
      const isUserMatch = selectedUserId === "all" || eventHasUserAssigned(event, selectedUserId);
      
      // Type filtering remains the same
      const isTypeMatch = selectedTypeId === "all" || (event.type && event.type.id.toString() === selectedTypeId.toString());

      return isInDateRange && isUserMatch && isTypeMatch;
    });
  }, [selectedDate, selectedUserId, selectedTypeId, events, view]);

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

  return (
    <div className="overflow-hidden rounded-xl border">
      <CalendarHeader 
        view={view} 
        events={filteredEvents} 
        onRefresh={refreshEvents}
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