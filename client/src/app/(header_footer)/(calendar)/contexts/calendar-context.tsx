// client/src/app/(header_footer)/(calendar)/contexts/calendar-context.tsx

"use client";

import { createContext, useContext, useState } from "react";

import type { Dispatch, SetStateAction } from "react";
import type { IEvent, IUser, IEventType, IInstrument } from "@/calendar/interfaces";
import type { TBadgeVariant, TVisibleHours, TWorkingHours } from "@/calendar/types";

interface ICalendarContext {
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  selectedUserId: IUser["id"] | "all";
  setSelectedUserId: (userId: IUser["id"] | "all") => void;
  selectedTypeId: IEventType["id"] | "all";
  setSelectedTypeId: (typeId: IEventType["id"] | "all") => void;
  selectedInstrumentId: IInstrument["id"] | "all" | "none";
  setSelectedInstrumentId: (instrumentId: IInstrument["id"] | "all" | "none") => void;
  badgeVariant: TBadgeVariant;
  setBadgeVariant: (variant: TBadgeVariant) => void;
  users: IUser[];
  eventTypes: IEventType[];
  instruments: IInstrument[];
  workingHours: TWorkingHours;
  setWorkingHours: Dispatch<SetStateAction<TWorkingHours>>;
  visibleHours: TVisibleHours;
  setVisibleHours: Dispatch<SetStateAction<TVisibleHours>>;
  events: IEvent[];
  setLocalEvents: Dispatch<SetStateAction<IEvent[]>>;
}

const CalendarContext = createContext({} as ICalendarContext);

const WORKING_HOURS = {
  0: { from: 0, to: 24 },
  1: { from: 0, to: 24 },
  2: { from: 0, to: 24 },
  3: { from: 0, to: 24 },
  4: { from: 0, to: 24 },
  5: { from: 0, to: 24 },
  6: { from: 0, to: 24 },
};

const VISIBLE_HOURS = { from: 0, to: 24 };

export function CalendarProvider({ 
  children, 
  users, 
  eventTypes = [],
  instruments = [],
  initialEvents = [] 
}: { 
  children: React.ReactNode; 
  users: IUser[]; 
  eventTypes: IEventType[];
  instruments: IInstrument[];
  initialEvents?: IEvent[] 
}) {
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>("colored");
  const [visibleHours, setVisibleHours] = useState<TVisibleHours>(VISIBLE_HOURS);
  const [workingHours, setWorkingHours] = useState<TWorkingHours>(WORKING_HOURS);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedUserId, setSelectedUserId] = useState<IUser["id"] | "all">("all");
  const [selectedTypeId, setSelectedTypeId] = useState<IEventType["id"] | "all">("all");
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<IInstrument["id"] | "all" | "none">("all");

  // Initialize with server-provided data instead of empty array
  const [localEvents, setLocalEvents] = useState<IEvent[]>(initialEvents);

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
  };

  return (
    <CalendarContext.Provider
      value={{
        selectedDate,
        setSelectedDate: handleSelectDate,
        selectedUserId,
        setSelectedUserId,
        selectedTypeId,
        setSelectedTypeId,
        selectedInstrumentId,
        setSelectedInstrumentId,
        badgeVariant,
        setBadgeVariant,
        users,
        eventTypes,
        instruments,
        visibleHours,
        setVisibleHours,
        workingHours,
        setWorkingHours,
        events: localEvents,
        setLocalEvents,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar(): ICalendarContext {
  const context = useContext(CalendarContext);
  if (!context) throw new Error("useCalendar must be used within a CalendarProvider.");
  return context;
}