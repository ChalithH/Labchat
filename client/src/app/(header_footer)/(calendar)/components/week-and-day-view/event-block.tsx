import { cva } from "class-variance-authority";
import { format, differenceInMinutes, parseISO } from "date-fns";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { EventDetailsDialog } from "@/calendar/components/dialogs/event-details-dialog";
import { CompactEventInfo } from "@/calendar/components/compact-event-info";
import { generateColorStyles } from "@/calendar/utils/color-utils";

import { cn } from "@/lib/utils";

import type { HTMLAttributes } from "react";
import type { IEvent } from "@/calendar/interfaces";

const calendarWeekEventCardVariants = cva(
  "flex select-none flex-col gap-0.5 truncate whitespace-nowrap rounded-md border px-2 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        colored: "border-[var(--event-border)] bg-[var(--event-bg)]",
        dot: "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700",
      },
    },
    defaultVariants: {
      variant: "colored",
    },
  }
);

interface IProps extends HTMLAttributes<HTMLDivElement> {
  event: IEvent;
}

export function EventBlock({ event, className }: IProps) {
  const { badgeVariant } = useCalendar();

  const start = parseISO(event.startDate);
  const end = parseISO(event.endDate);
  const durationInMinutes = differenceInMinutes(end, start);
  const heightInPixels = (durationInMinutes / 60) * 96 - 8;

  // Generate dynamic color styles
  const colorStyles = badgeVariant === "dot" ? {} : generateColorStyles(event.color);

  // Determine which variant to use
  const variant = badgeVariant === "dot" ? "dot" : "colored";

  const calendarWeekEventCardClasses = cn(
    calendarWeekEventCardVariants({ variant }),
    durationInMinutes < 35 && "py-0 justify-center",
    className
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (e.currentTarget instanceof HTMLElement) e.currentTarget.click();
    }
  };

  const isCompact = durationInMinutes < 45;

  return (
    <EventDetailsDialog event={event}>
      <div
        role="button"
        tabIndex={0}
        className={calendarWeekEventCardClasses}
        style={{ height: `${heightInPixels}px`, ...colorStyles }}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-1.5 truncate">
          {["mixed", "dot"].includes(badgeVariant) && (
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              className="shrink-0"
            >
              <circle cx="4" cy="4" r="4" fill={event.color} />
            </svg>
          )}

          <p className="truncate font-semibold text-gray-900">{event.title}</p>
        </div>

        {/* Display compact event info for events with enough height */}
        {!isCompact && <CompactEventInfo event={event} className="mt-0.5" />}

        {durationInMinutes > 25 && (
          <p className="mt-0.5 text-xs text-gray-600">
            {format(start, "h:mm a")} - {format(end, "h:mm a")}
          </p>
        )}

        {/* If event has more info and enough space, show the assigner */}
        {durationInMinutes > 60 && (
          <p className="text-[10px] text-gray-600 mt-0.5">
            Assigned by: {event.user.name}
          </p>
        )}
      </div>
    </EventDetailsDialog>
  );
}