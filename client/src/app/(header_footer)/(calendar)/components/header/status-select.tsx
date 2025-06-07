"use client";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface StatusSelectProps {
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function StatusSelect({ onRefresh, isLoading = false }: StatusSelectProps) {
  const { statuses, selectedStatusId, setSelectedStatusId } = useCalendar();
  
  const handleStatusChange = (statusId: string) => {
    setSelectedStatusId(statusId === "all" ? "all" : Number(statusId));
    // Don't trigger refresh here - let the context handle the filtering
  };

  return (
    <Select 
      value={selectedStatusId?.toString()} 
      onValueChange={handleStatusChange} 
      disabled={isLoading}
    >
      <SelectTrigger className="w-full md:w-48">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      
      <SelectContent>
        <SelectItem value="all">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            All Statuses
          </div>
        </SelectItem>
        
        {statuses.map(status => (
          <SelectItem key={status.id} value={status.id.toString()}>
            <div className="flex items-center gap-2">
              <Badge 
                className="text-white border-0 font-medium text-xs"
                style={{
                  backgroundColor: status.color || '#6B7280',
                  color: 'white'
                }}
              >
                {status.name}
              </Badge>
              {status.description && (
                <span className="text-sm text-muted-foreground">{status.description}</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}