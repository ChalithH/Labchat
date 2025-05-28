import Link from "next/link";
import { ChevronRight, Calendar, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { IEvent } from "@/calendar/interfaces";

interface EventBreadcrumbProps {
  event: IEvent;
}

export function EventBreadcrumb({ event }: EventBreadcrumbProps) {
  const startDate = parseISO(event.startDate);
  
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link 
        href="/calendar/month-view" 
        className="hover:text-foreground transition-colors"
      >
        <Calendar className="h-4 w-4" />
      </Link>
      
      <ChevronRight className="h-4 w-4" />
      
      <Link 
        href="/calendar/month-view" 
        className="hover:text-foreground transition-colors"
      >
        Calendar
      </Link>
      
      <ChevronRight className="h-4 w-4" />
      
      <Link 
        href={`/calendar/agenda-view`}
        className="hover:text-foreground transition-colors"
      >
        Events
      </Link>
      
      <ChevronRight className="h-4 w-4" />
      
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <span className="font-medium text-foreground">
          {format(startDate, "MMM d, yyyy")}
        </span>
      </div>
      
      <ChevronRight className="h-4 w-4" />
      
      <span className="font-medium text-foreground truncate max-w-xs">
        {event.title}
      </span>
    </nav>
  );
}
