"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from "date-fns";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Type definitions for props
type CalendarProps = {
  selected?: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  className?: string;
  fromDate?: Date;
  toDate?: Date;
};

export function SingleCalendar({
  selected,
  onSelect,
  className,
  fromDate,
  toDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());
  
  const handleDateSelect = (date: Date) => {
    onSelect(date);
  };
  
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };
  
  // Get days for the current month view
  const getDaysInMonth = () => {
    const firstDayOfMonth = startOfMonth(currentMonth);
    const lastDayOfMonth = endOfMonth(currentMonth);
    const startDate = startOfWeek(firstDayOfMonth);
    const endDate = endOfWeek(lastDayOfMonth);
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  };
  
  // Get days of week (for header)
  const daysOfWeek = eachDayOfInterval({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date()),
  });

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between">
        <Button
          variant="ghost" 
          size="sm"
          className="h-7 w-7 p-0"
          onClick={goToPreviousMonth}
          disabled={fromDate && startOfMonth(currentMonth) <= startOfMonth(fromDate)}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous month</span>
        </Button>
        
        <div className="font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={goToNextMonth}
          disabled={toDate && endOfMonth(currentMonth) >= endOfMonth(toDate)}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next month</span>
        </Button>
      </div>
      
      <div className="mt-3">
        {/* Days of week header */}
        <div className="mb-1 grid grid-cols-7">
          {daysOfWeek.map((day, i) => (
            <div
              key={i}
              className="h-9 w-9 text-center text-xs font-medium text-muted-foreground"
            >
              {format(day, "EEE").charAt(0)}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth().map((date, i) => {
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isSelectedDate = selected && isSameDay(date, selected);
            const isDisabled = 
              (fromDate && date < fromDate) || 
              (toDate && date > toDate);
            
            return (
              <div key={i} className="p-0">
                <button
                  type="button"
                  onClick={() => !isDisabled && handleDateSelect(date)}
                  disabled={isDisabled}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md text-sm",
                    isSelectedDate && "bg-primary text-primary-foreground",
                    !isSelectedDate && "hover:bg-accent",
                    !isCurrentMonth && "text-muted-foreground opacity-50",
                    isDisabled && "cursor-not-allowed opacity-30"
                  )}
                >
                  {format(date, "d")}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
