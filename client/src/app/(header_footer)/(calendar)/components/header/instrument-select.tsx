"use client";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Microscope } from "lucide-react";

interface InstrumentSelectProps {
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function InstrumentSelect({ onRefresh, isLoading = false }: InstrumentSelectProps) {
  const { instruments, selectedInstrumentId, setSelectedInstrumentId } = useCalendar();
  
  const handleInstrumentChange = (instrumentId: string) => {
    // Convert to number if not "all"
    setSelectedInstrumentId(instrumentId === "all" ? "all" : Number(instrumentId));
    
    // If there's a refresh function, call it to refetch events with the new instrument filter
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <Select 
      value={selectedInstrumentId?.toString()} 
      onValueChange={handleInstrumentChange} 
      disabled={isLoading}
    >
      <SelectTrigger className="w-full md:w-48">
        <SelectValue placeholder="Filter by instrument" />
      </SelectTrigger>
      
      <SelectContent>
        <SelectItem value="all">
          <div className="flex items-center gap-2">
            <Microscope className="h-4 w-4 text-muted-foreground" />
            All Instruments
          </div>
        </SelectItem>
        
        <SelectItem value="none">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">No Instrument</span>
          </div>
        </SelectItem>
        
        {instruments.map(instrument => (
          <SelectItem key={instrument.id} value={instrument.id.toString()}>
            <div className="flex items-center gap-2">
              <Microscope className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{instrument.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}