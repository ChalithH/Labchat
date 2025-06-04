"use client";

import { format, parseISO } from "date-fns";
import { cva } from "class-variance-authority";
import { Clock, Text, User, Users, Microscope } from "lucide-react";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { EventDetailsDialog } from "@/calendar/components/dialogs/event-details-dialog";
import { Badge } from "@/components/ui/badge";
import { generateColorStyles } from "@/calendar/utils/color-utils";

import type { IEvent } from "@/calendar/interfaces";

const agendaEventCardVariants = cva(
  "flex select-none flex-col gap-3 rounded-md border p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full mx-2 sm:mx-0",
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

interface IProps {
  event: IEvent;
  eventCurrentDay?: number;
  eventTotalDays?: number;
  searchQuery?: string;
}

// Helper function to highlight search terms
function highlightText(text: string, searchQuery?: string) {
  if (!searchQuery || !searchQuery.trim()) {
    return text;
  }

  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => (
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 dark:bg-yellow-900 px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  ));
}

export function AgendaEventCard({ event, eventCurrentDay, eventTotalDays, searchQuery }: IProps) {
  const { badgeVariant } = useCalendar();

  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);

  // Get the type name with proper formatting
  const typeName = event.type?.name || "Event";
  
  // Generate dynamic color styles
  const colorStyles = badgeVariant === "dot" ? {} : generateColorStyles(event.color);

  // Determine which variant to use
  const variant = badgeVariant === "dot" ? "dot" : "colored";

  const agendaEventCardClasses = agendaEventCardVariants({ variant });

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
      <div 
        role="button" 
        tabIndex={0} 
        className={agendaEventCardClasses} 
        style={colorStyles}
        onKeyDown={handleKeyDown}
      >
        {/* Header section with title and type */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {["mixed", "dot"].includes(badgeVariant) && (
              <svg width="8" height="8" viewBox="0 0 8 8" className="shrink-0">
                <circle cx="4" cy="4" r="4" fill={event.color} />
              </svg>
            )}

            <p className="font-medium text-gray-900 truncate max-w-[200px] sm:max-w-[300px] md:max-w-none">
              {eventCurrentDay && eventTotalDays && (
                <span className="mr-1 text-xs whitespace-nowrap">
                  Day {eventCurrentDay} of {eventTotalDays} •{" "}
                </span>
              )}
              <span className="break-words">
                {highlightText(event.title, searchQuery)}
              </span>
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Badge 
              className="text-white border-0 font-medium text-xs"
              style={{
                backgroundColor: event.type?.color || event.color,
                color: 'white'
              }}
            >
              {highlightText(typeName, searchQuery)}
            </Badge>
            
            {event.status && (
              <Badge className="capitalize bg-black text-white border-black text-xs">
                {event.status}
              </Badge>
            )}
          </div>
        </div>

        {/* Main info section - stacked on mobile, side by side on larger screens */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* First row of info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 min-w-0">
              <User className="size-3.5 shrink-0 text-gray-500" />
              <p className="text-xs text-gray-700 truncate">
                Assigner: {highlightText(event.user.name, searchQuery)}
              </p>
            </div>

            <div className="flex items-center gap-1 min-w-0">
              <Clock className="size-3.5 shrink-0 text-gray-500" />
              <p className="text-xs text-gray-700">
                {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
              </p>
            </div>
          </div>

          {/* Second row of info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            {hasAssignments && (
              <div className="flex items-center gap-1 min-w-0">
                <Users className="size-3.5 shrink-0 text-gray-500" />
                <p className="text-xs text-gray-700">
                  {event.assignments?.length ?? 0} {event.assignments?.length === 1 ? "member" : "members"} assigned
                </p>
              </div>
            )}

            {hasInstrument && (
              <div className="flex items-center gap-1 min-w-0">
                <Microscope className="size-3.5 shrink-0 text-gray-500" />
                <p className="text-xs text-gray-700 truncate">
                  {event.instrument?.name ? highlightText(event.instrument.name, searchQuery) : "N/A"}
                </p>
              </div>
            )}
          </div>

          {/* Description - full width */}
          {event.description && (
            <div className="flex items-start gap-1">
              <Text className="size-3.5 shrink-0 text-gray-500 mt-0.5" />
              <p className="text-xs text-gray-700 break-words">
                {highlightText(event.description, searchQuery)}
              </p>
            </div>
          )}

          {/* Show assigned member names if they match search */}
          {searchQuery && hasAssignments && event.assignments?.some(assignment => 
            assignment.name.toLowerCase().includes(searchQuery.toLowerCase())
          ) && (
            <div className="flex items-start gap-1">
              <Users className="size-3.5 shrink-0 text-gray-500 mt-0.5" />
              <div className="text-xs text-gray-700 break-words">
                <span className="text-gray-500">Assigned to:</span>{" "}
                {event.assignments
                  ?.filter(assignment => assignment.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((assignment, index, arr) => (
                    <span key={assignment.id}>
                      {highlightText(assignment.name, searchQuery)}
                      {index < arr.length - 1 && ", "}
                    </span>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </EventDetailsDialog>
  );
}