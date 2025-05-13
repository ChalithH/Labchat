import { format } from "date-fns";
import { useMemo } from "react";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { cn } from "@/lib/utils"; 


export function TodayButton({ disabled = false }: { disabled?: boolean }) {
  const { setSelectedDate } = useCalendar();
  
  // Use useMemo for the display date to avoid re-renders
  const displayDate = useMemo(() => new Date(), []);
  
  return (
    <button
      className={cn(
        "flex size-14 flex-col items-start overflow-hidden rounded-lg border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => !disabled && setSelectedDate(new Date())}
      disabled={disabled}
    >
      <p className="flex h-6 w-full items-center justify-center bg-primary text-center text-xs font-semibold text-primary-foreground">
        {format(displayDate, "MMM").toUpperCase()}
      </p>
      <p className="flex w-full items-center justify-center text-lg font-bold">{displayDate.getDate()}</p>
    </button>
  );
}