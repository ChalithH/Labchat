import { useMemo, useState } from "react";
import { CalendarX2 } from "lucide-react";
import { parseISO, format, endOfDay, startOfDay, isSameMonth } from "date-fns";

import { useCalendar } from "@/calendar/contexts/calendar-context";

import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchInput } from "@/calendar/components/search-input";
import { AgendaDayGroup } from "@/calendar/components/agenda-view/agenda-day-group";

import type { IEvent } from "@/calendar/interfaces";

interface IProps {
  singleDayEvents: IEvent[];
  multiDayEvents: IEvent[];
}

export function CalendarAgendaView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate } = useCalendar();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter events based on search query
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) {
      return { singleDayEvents, multiDayEvents };
    }

    const query = searchQuery.toLowerCase().trim();
    
    const filterEventsByQuery = (events: IEvent[]) => {
      return events.filter(event => {
        // Search in title
        if (event.title.toLowerCase().includes(query)) return true;
        
        // Search in description
        if (event.description?.toLowerCase().includes(query)) return true;
        
        // Search in user name (assigner)
        if (event.user.name.toLowerCase().includes(query)) return true;
        
        // Search in event type
        if (event.type?.name.toLowerCase().includes(query)) return true;
        
        // Search in instrument name
        if (event.instrument?.name?.toLowerCase().includes(query)) return true;
        
        // Search in assigned member names
        if (event.assignments?.some(assignment => 
          assignment.name.toLowerCase().includes(query)
        )) return true;

        return false;
      });
    };

    return {
      singleDayEvents: filterEventsByQuery(singleDayEvents),
      multiDayEvents: filterEventsByQuery(multiDayEvents)
    };
  }, [singleDayEvents, multiDayEvents, searchQuery]);

  const eventsByDay = useMemo(() => {
    const allDates = new Map<string, { date: Date; events: IEvent[]; multiDayEvents: IEvent[] }>();

    filteredEvents.singleDayEvents.forEach(event => {
      const eventDate = parseISO(event.startDate);
      if (!isSameMonth(eventDate, selectedDate)) return;

      const dateKey = format(eventDate, "yyyy-MM-dd");

      if (!allDates.has(dateKey)) {
        allDates.set(dateKey, { date: startOfDay(eventDate), events: [], multiDayEvents: [] });
      }

      allDates.get(dateKey)?.events.push(event);
    });

    filteredEvents.multiDayEvents.forEach(event => {
      const eventStart = parseISO(event.startDate);
      const eventEnd = parseISO(event.endDate);

      let currentDate = startOfDay(eventStart);
      const lastDate = endOfDay(eventEnd);

      while (currentDate <= lastDate) {
        if (isSameMonth(currentDate, selectedDate)) {
          const dateKey = format(currentDate, "yyyy-MM-dd");

          if (!allDates.has(dateKey)) {
            allDates.set(dateKey, { date: new Date(currentDate), events: [], multiDayEvents: [] });
          }

          allDates.get(dateKey)?.multiDayEvents.push(event);
        }
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      }
    });

    return Array.from(allDates.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [filteredEvents.singleDayEvents, filteredEvents.multiDayEvents, selectedDate]);

  const hasAnyEvents = singleDayEvents.length > 0 || multiDayEvents.length > 0;
  const hasFilteredEvents = filteredEvents.singleDayEvents.length > 0 || filteredEvents.multiDayEvents.length > 0;

  return (
    <div className="flex flex-col h-[800px]">
      {/* Search Bar - Full Width */}
      <div className="p-4 border-b bg-background shrink-0">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search events by title, description, assigner, type, or assigned members..."
          className="w-full"
        />
        {searchQuery && (
          <p className="text-xs text-muted-foreground mt-2">
            {hasFilteredEvents 
              ? `Found ${filteredEvents.singleDayEvents.length + filteredEvents.multiDayEvents.length} event(s) matching "${searchQuery}"`
              : `No events found matching "${searchQuery}"`
            }
          </p>
        )}
      </div>

      {/* Events List - Scrollable */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full" type="always">
          <div className="space-y-6 p-4">
            {eventsByDay.map(dayGroup => (
              <AgendaDayGroup 
                key={format(dayGroup.date, "yyyy-MM-dd")} 
                date={dayGroup.date} 
                events={dayGroup.events} 
                multiDayEvents={dayGroup.multiDayEvents}
                searchQuery={searchQuery}
              />
            ))}

            {!hasAnyEvents && (
              <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
                <CalendarX2 className="size-10" />
                <p className="text-sm md:text-base">No events scheduled for the selected month</p>
              </div>
            )}

            {hasAnyEvents && !hasFilteredEvents && searchQuery && (
              <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
                <CalendarX2 className="size-10" />
                <p className="text-sm md:text-base">No events found matching your search</p>
                <p className="text-xs">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}