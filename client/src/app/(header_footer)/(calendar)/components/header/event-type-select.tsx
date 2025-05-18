"use client";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EventTypeSelectProps {
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function EventTypeSelect({ onRefresh, isLoading = false }: EventTypeSelectProps) {
  const { eventTypes, selectedTypeId, setSelectedTypeId } = useCalendar();
  
  const handleTypeChange = (typeId: string) => {
    // Convert to number if not "all"
    setSelectedTypeId(typeId === "all" ? "all" : Number(typeId));
    
    // If there's a refresh function, call it to refetch events with the new type filter
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <Select value={selectedTypeId?.toString()} onValueChange={handleTypeChange} disabled={isLoading}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Filter by type" />
      </SelectTrigger>
      
      <SelectContent>
        <SelectItem value="all">All Types</SelectItem>
        
        {eventTypes.map(type => (
          <SelectItem key={type.id} value={type.id.toString()}>
            <div className="flex items-center gap-2">
              <div className={`size-3 rounded-full bg-${type.color || 'green'}-600`} />
              {type.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}