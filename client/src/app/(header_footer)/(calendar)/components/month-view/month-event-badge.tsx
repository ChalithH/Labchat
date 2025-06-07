import { cva } from "class-variance-authority";
import { endOfDay, format, isSameDay, parseISO, startOfDay } from "date-fns";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { EventDetailsDialog } from "@/calendar/components/dialogs/event-details-dialog";
import { generateColorStyles } from "@/calendar/utils/color-utils";

import { cn } from "@/lib/utils";

import type { IEvent } from "@/calendar/interfaces";

const eventBadgeVariants = cva(
  "mx-1 flex size-auto h-6 select-none items-center justify-between gap-1.5 truncate whitespace-nowrap rounded-md border px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        colored: "border-[var(--event-border)] bg-[var(--event-bg)] text-[var(--event-text)]",
        dot: "bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border-neutral-200 dark:border-neutral-700",
      },
      multiDayPosition: {
        first:
          "relative z-10 mr-0 w-[calc(100%_-_3px)] rounded-r-none border-r-0 [&>span]:mr-2.5",
        middle:
          "relative z-10 mx-0 w-[calc(100%_+_1px)] rounded-none border-x-0",
        last: "ml-0 rounded-l-none border-l-0",
        none: "",
      },
    },
    defaultVariants: {
      variant: "colored",
    },
  }
);

interface IProps {
  event: IEvent;
  cellDate: Date;
  eventCurrentDay?: number;
  eventTotalDays?: number;
  className?: string;
  position?: "first" | "middle" | "last" | "none";
}

export function MonthEventBadge({
  event,
  cellDate,
  eventCurrentDay,
  eventTotalDays,
  className,
  position: propPosition,
}: IProps) {
  const { badgeVariant } = useCalendar();

  const itemStart = startOfDay(parseISO(event.startDate));
  const itemEnd = endOfDay(parseISO(event.endDate));

  if (cellDate < itemStart || cellDate > itemEnd) return null;

  let position: "first" | "middle" | "last" | "none" | undefined;

  if (propPosition) {
    position = propPosition;
  } else if (eventCurrentDay && eventTotalDays) {
    position = "none";
  } else if (isSameDay(itemStart, itemEnd)) {
    position = "none";
  } else if (isSameDay(cellDate, itemStart)) {
    position = "first";
  } else if (isSameDay(cellDate, itemEnd)) {
    position = "last";
  } else {
    position = "middle";
  }

  const renderBadgeText = ["first", "none"].includes(position);

  // Generate dynamic color styles
  const colorStyles = badgeVariant === "dot" ? {} : generateColorStyles(event.color);

  // Determine which variant to use
  const variant = badgeVariant === "dot" ? "dot" : "colored";

  const eventBadgeClasses = cn(
    eventBadgeVariants({ variant, multiDayPosition: position, className })
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (e.currentTarget instanceof HTMLElement) e.currentTarget.click();
    }
  };

  return (
    <EventDetailsDialog event={event}>
      <div
        role="button"
        tabIndex={0}
        className={eventBadgeClasses}
        style={colorStyles}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-1.5 truncate">
          {!["middle", "last"].includes(position) &&
            ["mixed", "dot"].includes(badgeVariant) && (
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                className="shrink-0"
              >
                <circle cx="4" cy="4" r="4" fill={event.color} />
              </svg>
            )}

          {renderBadgeText && (
            <div className="flex-1 truncate">
              <p className="font-semibold truncate text-gray-900">
                {eventCurrentDay && (
                  <span className="text-xs">
                    Day {eventCurrentDay} of {eventTotalDays} •{" "}
                  </span>
                )}
                {event.title}
              </p>
            </div>
          )}
        </div>

        {renderBadgeText && (
          <span className="shrink-0 text-xs text-gray-600 ml-1">
            {format(new Date(event.startDate), "h:mm a")}
          </span>
        )}
      </div>
    </EventDetailsDialog>
  );
}