import { useCallback } from "react";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { TCalendarView } from "@/calendar/types"; // Add this import

// Optional: If you have a helper for getting the current view
// import { getCurrentViewFromURL } from "@/calendar/helpers";

import { AvatarGroup } from "@/components/ui/avatar-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserSelectProps {
  onRefresh?: (view?: TCalendarView, date?: Date) => void;
  isLoading?: boolean; // Add this prop instead of trying to use IsLoading
}

export function UserSelect({ onRefresh, isLoading }: UserSelectProps) {
  const { users, selectedUserId, setSelectedUserId, selectedDate } = useCalendar();
  
  const handleUserChange = useCallback((userId: string) => {
    setSelectedUserId(userId);
    
    // Get current view - you need to implement or import this function
    // or pass the current view as a prop
    const currentView = "month" as TCalendarView; // Default to month if you don't have the function
    
    // Refresh events with the new user selection
    if (onRefresh) {
      onRefresh(currentView, selectedDate);
    }
  }, [setSelectedUserId, onRefresh, selectedDate]);
  
  return (
    <Select value={selectedUserId} onValueChange={handleUserChange} disabled={isLoading}>
      <SelectTrigger className="flex-1 md:w-48">
        <SelectValue />
      </SelectTrigger>

      <SelectContent align="end">
        <SelectItem value="all">
          <div className="flex items-center gap-1">
            <AvatarGroup max={2}>
              {users.map(user => (
                <Avatar key={user.id} className="size-6 text-xxs">
                  <AvatarImage src={user.picturePath ?? undefined} alt={user.name} />
                  <AvatarFallback className="text-xxs">{user.name[0]}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
            All
          </div>
        </SelectItem>

        {users.map(user => (
          <SelectItem key={user.id} value={user.id} className="flex-1">
            <div className="flex items-center gap-2">
              <Avatar key={user.id} className="size-6">
                <AvatarImage src={user.picturePath ?? undefined} alt={user.name} />
                <AvatarFallback className="text-xxs">{user.name[0]}</AvatarFallback>
              </Avatar>

              <p className="truncate">{user.name}</p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}