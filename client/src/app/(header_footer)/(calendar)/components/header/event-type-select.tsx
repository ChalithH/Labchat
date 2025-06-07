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
    setSelectedTypeId(typeId === "all" ? "all" : Number(typeId));
    // Don't trigger refresh here - let the context handle the filtering
  };

  return (
    <Select value={selectedTypeId?.toString()} onValueChange={handleTypeChange} disabled={isLoading}>
      <SelectTrigger className="w-full md:w-48">
        <SelectValue placeholder="Filter by type" />
      </SelectTrigger>
      
      <SelectContent>
        <SelectItem value="all">All Types</SelectItem>
        
        {eventTypes.map(type => (
          <SelectItem key={type.id} value={type.id.toString()}>
            <div className="flex items-center gap-2">
              <div 
                className="size-3 rounded-full" 
                style={{ backgroundColor: type.color || '#10B981' }}
              />
              {type.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
