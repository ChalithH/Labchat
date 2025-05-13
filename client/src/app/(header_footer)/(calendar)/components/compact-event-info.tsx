import { Users, Microscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { eventTypeColors } from "@/calendar/requests";
import type { IEvent } from "@/calendar/interfaces";

interface CompactEventInfoProps {
  event: IEvent;
  className?: string;
  showBadges?: boolean;
}

export function CompactEventInfo({ event, className, showBadges = true }: CompactEventInfoProps) {
  // Find the event type based on color
  const eventType = Object.entries(eventTypeColors).find(([, color]) => color === event.color)?.[0] || "default";
  
  // Format the type label for display
  const typeLabel = eventType.charAt(0).toUpperCase() + eventType.slice(1);
  
  const hasAssignments = event.assignments && event.assignments.length > 0;
  const hasInstrument = !!event.instrument;
  
  // Don't render anything if there's nothing to show and badges are hidden
  if (!showBadges && !hasAssignments && !hasInstrument) {
    return null;
  }
  
  return (
    <div className={cn("flex items-center gap-1 text-xs", className)}>
      {/* Event Type Badge (if showing badges) */}
      {showBadges && (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Badge 
                variant={eventType === "rostering" ? "default" : eventType === "equipment" ? "secondary" : "outline"}
                className="px-1 py-0 h-4 text-[10px]"
              >
                {typeLabel}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {typeLabel} Event
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {/* Assignments Indicator */}
      {hasAssignments && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-0.5 text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{event.assignments?.length ?? 0}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="p-2">
              <p className="font-semibold mb-1 text-xs">Assigned Members:</p>
              <ul className="space-y-1 text-xs">
                {event.assignments?.map(assignment => (
                  <li key={assignment.id}>{assignment.name}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {/* Instrument Indicator */}
      {hasInstrument && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-muted-foreground">
                <Microscope className="h-3 w-3" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p>Instrument: {event.instrument?.name || "N/A"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}