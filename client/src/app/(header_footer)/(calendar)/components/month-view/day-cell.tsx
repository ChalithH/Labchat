import { useMemo } from "react";
import { isToday, startOfDay } from "date-fns";

import { EventBullet } from "@/calendar/components/month-view/event-bullet";
import { MonthEventBadge } from "@/calendar/components/month-view/month-event-badge";
import { AddEventDialog } from "@/calendar/components/dialogs/add-event-dialog";

import { cn } from "@/lib/utils";
import { getMonthCellEvents } from "@/calendar/helpers";

import type { ICalendarCell, IEvent } from "@/calendar/interfaces";

interface IProps {
  cell: ICalendarCell;
  events: IEvent[];
  eventPositions: Record<string, number>;
}

const MAX_VISIBLE_EVENTS = 3;

export function DayCell({ cell, events, eventPositions }: IProps) {
  const { day, currentMonth, date } = cell;

  const cellEvents = useMemo(
    () => getMonthCellEvents(date, events, eventPositions),
    [date, events, eventPositions]
  );
  const isSunday = date.getDay() === 0;

  return (
    <div
      className={cn(
        "relative flex h-full flex-col gap-1 border-l border-t py-1.5 lg:py-2",
        isSunday && "border-l-0",
        !currentMonth && "opacity-50"
      )}
    >
      {/* Clickable background layer for creating events */}
      <AddEventDialog
        startDate={startOfDay(date)}
        startTime={{ hour: 9, minute: 0 }} // Default to 9 AM
      >
        <div className="absolute inset-0 cursor-pointer transition-colors hover:bg-accent/30 z-0" />
      </AddEventDialog>

      {/* Day number - clickable for event creation */}
      <AddEventDialog
        startDate={startOfDay(date)}
        startTime={{ hour: 9, minute: 0 }}
      >
        <span
          className={cn(
            "relative z-10 h-6 px-1 text-xs font-semibold lg:px-2 cursor-pointer hover:bg-accent/50 rounded transition-colors",
            !currentMonth && "opacity-20",
            isToday(date) &&
              "flex w-6 translate-x-1 items-center justify-center rounded-full bg-primary px-0 font-bold text-primary-foreground"
          )}
        >
          {day}
        </span>
      </AddEventDialog>

      {/* Events container */}
      <div
        className={cn(
          "relative z-10 flex h-6 gap-1 px-2 lg:h-[94px] lg:flex-col lg:gap-2 lg:px-0",
          !currentMonth && "opacity-50"
        )}
      >
        {[0, 1, 2].map((position) => {
          const event = cellEvents.find((e) => e.position === position);
          const eventKey = event
            ? `event-${event.id}-${position}`
            : `empty-${position}`;

          return (
            <div key={eventKey} className="lg:flex-1">
              {event ? (
                // Events have their own click handlers and higher z-index
                <>
                  <EventBullet className="lg:hidden relative z-20" color={event.color} />
                  <MonthEventBadge
                    className="hidden lg:flex relative z-20"
                    event={event}
                    cellDate={startOfDay(date)}
                  />
                </>
              ) : (
                // Empty slots are clickable for event creation
                <AddEventDialog
                  startDate={startOfDay(date)}
                  startTime={{ hour: 9, minute: 0 }}
                >
                  <div className="h-full w-full cursor-pointer hover:bg-accent/30 rounded transition-colors lg:min-h-[24px]" />
                </AddEventDialog>
              )}
            </div>
          );
        })}
      </div>

      {/* More events indicator - clickable for event creation */}
      {cellEvents.length > MAX_VISIBLE_EVENTS && (
        <AddEventDialog
          startDate={startOfDay(date)}
          startTime={{ hour: 9, minute: 0 }}
        >
          <p
            className={cn(
              "relative z-10 h-4.5 px-1.5 text-xs font-semibold text-muted-foreground cursor-pointer hover:bg-accent/50 rounded transition-colors",
              !currentMonth && "opacity-50"
            )}
          >
            <span className="sm:hidden">
              +{cellEvents.length - MAX_VISIBLE_EVENTS}
            </span>
            <span className="hidden sm:inline">
              {" "}
              {cellEvents.length - MAX_VISIBLE_EVENTS} more...
            </span>
          </p>
        </AddEventDialog>
      )}
    </div>
  );
}