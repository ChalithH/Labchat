import Link from "next/link";
import { Columns, List, Plus, Grid2x2, CalendarRange, RefreshCw, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { UserSelect } from "@/calendar/components/header/user-select";
import { EventTypeSelect } from "@/calendar/components/header/event-type-select"; 
import { InstrumentSelect } from "@/calendar/components/header/instrument-select";
import { StatusSelect } from "@/calendar/components/header/status-select";
import { TodayButton } from "@/calendar/components/header/today-button";
import { DateNavigator } from "@/calendar/components/header/date-navigator";
import { AddEventDialog } from "@/calendar/components/dialogs/add-event-dialog";

import type { IEvent } from "@/calendar/interfaces";
import type { TCalendarView } from "@/calendar/types";

interface IProps {
  view: TCalendarView;
  events: IEvent[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function CalendarHeader({ view, events, onRefresh, isLoading }: IProps) {
  return (
    <div className="border-b p-4 space-y-4">
      {/* First row: Today button, date navigator, view selector, refresh button, and add event */}
      <div className="flex gap-4 flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center gap-3">
          <TodayButton disabled={isLoading} />
          <DateNavigator 
            view={view} 
            events={events} 
            onRefresh={onRefresh}
            isLoading={isLoading}
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isLoading ? "Loading..." : "Refresh"}
          </Button>

          {/* View selector */}
          <div className="inline-flex first:rounded-r-none last:rounded-l-none [&:not(:first-child):not(:last-child)]:rounded-none">
            <Button 
              asChild 
              aria-label="View by day" 
              size="icon" 
              variant={view === "day" ? "default" : "outline"} 
              className="rounded-r-none [&_svg]:size-5"
            >
              <Link href="/calendar/day-view">
                <List strokeWidth={1.8} />
              </Link>
            </Button>

            <Button
              asChild
              aria-label="View by week"
              size="icon"
              variant={view === "week" ? "default" : "outline"}
              className="-ml-px rounded-none [&_svg]:size-5"
            >
              <Link href="/calendar/week-view">
                <Columns strokeWidth={1.8} />
              </Link>
            </Button>

            <Button
              asChild
              aria-label="View by month"
              size="icon"
              variant={view === "month" ? "default" : "outline"}
              className="-ml-px rounded-none [&_svg]:size-5"
            >
              <Link href="/calendar/month-view">
                <Grid2x2 strokeWidth={1.8} />
              </Link>
            </Button>

            <Button
              asChild
              aria-label="View by agenda"
              size="icon"
              variant={view === "agenda" ? "default" : "outline"}
              className="-ml-px rounded-l-none [&_svg]:size-5"
            >
              <Link href="/calendar/agenda-view">
                <CalendarRange strokeWidth={1.8} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Add Event button */}
        <AddEventDialog>
          <Button disabled={isLoading} className="w-full md:w-64" >
            <Plus />
            Add Event
          </Button>
        </AddEventDialog>
        
        {/* Second row: Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <UserSelect isLoading={isLoading} />
          <EventTypeSelect isLoading={isLoading} />
          <InstrumentSelect isLoading={isLoading} />
          <StatusSelect isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}