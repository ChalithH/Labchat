// In date-navigator.tsx
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useCalendar } from "@/calendar/contexts/calendar-context";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getEventsCount, navigateDate, rangeText } from "@/calendar/helpers";

import type { IEvent } from "@/calendar/interfaces";
import type { TCalendarView } from "@/calendar/types";

interface IProps {
  view: TCalendarView;
  events: IEvent[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function DateNavigator({ view, events, onRefresh, isLoading = false }: IProps) {
  const { selectedDate, setSelectedDate } = useCalendar();
  const [isNavigating, setIsNavigating] = useState(false);

  const month = format(selectedDate, "MMMM");
  const year = selectedDate.getFullYear();

  const eventCount = useMemo(() => getEventsCount(events, selectedDate, view), [events, selectedDate, view]);

  // Create a navigation handler that will also refresh events
  const handleNavigation = useCallback(async (direction: "previous" | "next") => {
    if (isNavigating || isLoading) return; // Prevent navigation if already in progress
    
    setIsNavigating(true); // Set navigating state to true
    
    const newDate = navigateDate(selectedDate, view, direction);
    setSelectedDate(newDate);
    
    // If onRefresh is provided, call it
    if (onRefresh) {
      try {
        // This will trigger a re-fetch with the new date
        onRefresh();
      } catch (error) {
        console.error("Error during navigation refresh:", error);
      }
    } else {
      // If no refresh function is provided, we need to reset the navigation state
      setIsNavigating(false);
    }
  }, [selectedDate, view, setSelectedDate, onRefresh, isNavigating, isLoading]);

  // Reset navigating state when loading state changes from true to false
  useEffect(() => {
    if (!isLoading) {
      setIsNavigating(false);
    }
  }, [isLoading]);

  const handlePrevious = () => handleNavigation("previous");
  const handleNext = () => handleNavigation("next");

  // Disable buttons during navigation or loading
  const isDisabled = isNavigating || isLoading;

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">
          {month} {year}
        </span>
        <Badge variant="outline" className="px-1.5">
          {eventCount} events
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          className="size-6.5 px-0 [&_svg]:size-4.5" 
          onClick={handlePrevious}
          disabled={isDisabled}
        >
          <ChevronLeft />
        </Button>

        <p className="text-sm text-muted-foreground">{rangeText(view, selectedDate)}</p>

        <Button 
          variant="outline" 
          className="size-6.5 px-0 [&_svg]:size-4.5" 
          onClick={handleNext}
          disabled={isDisabled}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}