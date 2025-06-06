import { useCallback } from "react";
import { useCalendar } from "@/calendar/contexts/calendar-context";

import { AvatarGroup } from "@/components/ui/avatar-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserSelectProps {
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function UserSelect({ onRefresh, isLoading }: UserSelectProps) {
  const { users, selectedUserId, setSelectedUserId } = useCalendar();
  
  const handleUserChange = useCallback((userId: string) => {
    setSelectedUserId(userId);
    // Don't trigger refresh here - let the context handle the filtering
  }, [setSelectedUserId]);
  
  return (
    <Select value={selectedUserId} onValueChange={handleUserChange} disabled={isLoading}>
      <SelectTrigger className="w-full md:w-48">
        <SelectValue />
      </SelectTrigger>

      <SelectContent align="end">
        <SelectItem value="all">
          <div className="flex items-center gap-1">
            <AvatarGroup max={2}>
              {users.slice(0, 3).map(user => (
                <Avatar key={user.id} className="size-6 text-xxs">
                  <AvatarImage src={user.picturePath ?? undefined} alt={user.name} />
                  <AvatarFallback className="text-xxs">{user.name[0]}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
            All Assigned Users
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