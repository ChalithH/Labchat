import { Users, Microscope, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { IEvent } from "@/calendar/interfaces";

interface CompactEventInfoProps {
  event: IEvent;
  className?: string;
  showBadges?: boolean;
  showStatus?: boolean;
}

export function CompactEventInfo({ 
  event, 
  className, 
  showBadges = true, 
  showStatus = true 
}: CompactEventInfoProps) {
  // Get the type name with proper formatting
  const typeName = event.type?.name || "Event";
  
  const hasAssignments = event.assignments && event.assignments.length > 0;
  const hasInstrument = !!event.instrument;
  const hasStatus = !!event.status;
  
  // Don't render anything if there's nothing to show and badges are hidden
  if (!showBadges && !hasAssignments && !hasInstrument && !hasStatus) {
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
                className="px-1 py-0 h-4 text-[10px] text-white border-0 font-medium"
                style={{
                  backgroundColor: event.type?.color || event.color,
                  color: 'white'
                }}
              >
                {typeName}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {typeName} Event
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Status Badge (if showing status and status exists) */}
      {showStatus && hasStatus && (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Badge 
                className="px-1 py-0 h-4 text-[10px] text-white border-0 font-medium"
                style={{
                  backgroundColor: event.status?.color || '#6B7280',
                  color: 'white'
                }}
              >
                {event.status?.name}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Status: {event.status?.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {/* Assignments Indicator */}
      {hasAssignments && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-0.5 text-gray-600">
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
              <div className="flex items-center text-gray-600">
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