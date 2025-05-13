"use client";

import { format, parseISO } from "date-fns";
import { cva } from "class-variance-authority";
import { Clock, Text, User, Users, Microscope } from "lucide-react";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { EventDetailsDialog } from "@/calendar/components/dialogs/event-details-dialog";
import { Badge } from "@/components/ui/badge";
import { eventTypeColors } from "@/calendar/requests";

import type { IEvent } from "@/calendar/interfaces";
import type { VariantProps } from "class-variance-authority";

const agendaEventCardVariants = cva(
  "flex select-none items-center justify-between gap-3 rounded-md border p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  {
    variants: {
      color: {
        // Colored variants
        blue: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 [&_.event-dot]:fill-blue-600",
        green: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300 [&_.event-dot]:fill-green-600",
        red: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 [&_.event-dot]:fill-red-600",
        yellow: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 [&_.event-dot]:fill-yellow-600",
        purple: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300 [&_.event-dot]:fill-purple-600",
        orange: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300 [&_.event-dot]:fill-orange-600",
        gray: "border-neutral-200 bg-neutral-50 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 [&_.event-dot]:fill-neutral-600",

        // Dot variants
        "blue-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-blue-600",
        "green-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-green-600",
        "red-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-red-600",
        "orange-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-orange-600",
        "purple-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-purple-600",
        "yellow-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-yellow-600",
        "gray-dot": "bg-neutral-50 dark:bg-neutral-900 [&_.event-dot]:fill-neutral-600",
      },
    },
    defaultVariants: {
      color: "blue-dot",
    },
  }
);

interface IProps {
  event: IEvent;
  eventCurrentDay?: number;
  eventTotalDays?: number;
}

export function AgendaEventCard({ event, eventCurrentDay, eventTotalDays }: IProps) {
  const { badgeVariant } = useCalendar();

  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);

  // Find the event type based on color
  const eventType = Object.entries(eventTypeColors).find(([, color]) => color === event.color)?.[0] || "default";
  
  // Format the type label for display
  const typeLabel = eventType.charAt(0).toUpperCase() + eventType.slice(1);

  const color = (badgeVariant === "dot" ? `${event.color}-dot` : event.color) as VariantProps<typeof agendaEventCardVariants>["color"];

  const agendaEventCardClasses = agendaEventCardVariants({ color });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (e.currentTarget instanceof HTMLElement) e.currentTarget.click();
    }
  };

  const hasAssignments = event.assignments && event.assignments.length > 0;
  const hasInstrument = !!event.instrument;

  return (
    <EventDetailsDialog event={event}>
      <div role="button" tabIndex={0} className={agendaEventCardClasses} onKeyDown={handleKeyDown}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            {["mixed", "dot"].includes(badgeVariant) && (
              <svg width="8" height="8" viewBox="0 0 8 8" className="event-dot shrink-0">
                <circle cx="4" cy="4" r="4" />
              </svg>
            )}

            <div className="flex items-center gap-2">
              <p className="font-medium">
                {eventCurrentDay && eventTotalDays && (
                  <span className="mr-1 text-xs">
                    Day {eventCurrentDay} of {eventTotalDays} •{" "}
                  </span>
                )}
                {event.title}
              </p>
              
              <Badge 
                variant={eventType === "rostering" ? "default" : eventType === "equipment" ? "secondary" : "outline"}
                className="ml-1"
              >
                {typeLabel}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="size-3.5 shrink-0 text-muted-foreground" />
              <p className="text-xs text-foreground">Assigner: {event.user.name}</p>
            </div>

            {hasAssignments && (
              <div className="flex items-center gap-1">
                <Users className="size-3.5 shrink-0 text-muted-foreground" />
                <p className="text-xs text-foreground">
                  {event.assignments?.length ?? 0} {event.assignments?.length === 1 ? "member" : "members"} assigned
                </p>
              </div>
            )}

            {hasInstrument && (
              <div className="flex items-center gap-1">
                <Microscope className="size-3.5 shrink-0 text-muted-foreground" />
                <p className="text-xs text-foreground">
                  {event.instrument?.name || "N/A"}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="size-3.5 shrink-0 text-muted-foreground" />
              <p className="text-xs text-foreground">
                {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
              </p>
            </div>

            {event.description && (
              <div className="flex items-center gap-1">
                <Text className="size-3.5 shrink-0 text-muted-foreground" />
                <p className="text-xs text-foreground max-w-[300px] truncate">{event.description}</p>
              </div>
            )}
          </div>
        </div>
        
        {event.status && (
          <Badge variant="outline" className="capitalize">
            {event.status}
          </Badge>
        )}
      </div>
    </EventDetailsDialog>
  );
}