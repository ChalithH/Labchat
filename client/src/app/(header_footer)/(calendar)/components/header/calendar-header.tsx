import Link from "next/link";
import { Columns, List, Plus, Grid2x2, CalendarRange, RefreshCw, Loader2  } from "lucide-react";

import { Button } from "@/components/ui/button";

import { UserSelect } from "@/calendar/components/header/user-select";
import { EventTypeSelect } from "@/calendar/components/header/event-type-select"; 
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

export function CalendarHeader({ view, events, onRefresh, isLoading  }: IProps) {
  return (
    <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <TodayButton disabled={isLoading} />
        <DateNavigator 
          view={view} 
          events={events} 
          onRefresh={onRefresh}
          isLoading={isLoading}
        />

        {onRefresh && (
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onRefresh} 
            className="ml-2"
            title="Refresh events"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-between">
        <div className="flex w-full items-center gap-1.5">
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

          <div className="flex space-x-2">
            <UserSelect onRefresh={onRefresh} isLoading={isLoading} />
            <EventTypeSelect onRefresh={onRefresh} isLoading={isLoading} />
          </div>
        </div>

        <AddEventDialog>
          <Button className="w-full sm:w-auto" disabled={isLoading}>
            <Plus />
            Add Event
          </Button>
        </AddEventDialog>
      </div>
    </div>
  );
}