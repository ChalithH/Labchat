"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  startOfDay, endOfDay, 
  startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, 
  startOfYear, endOfYear,
} from 'date-fns';

import { getEvents } from "@/calendar/requests";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useCurrentLabId } from "@/contexts/lab-context";
import type { TCalendarView } from "@/calendar/types";
import type { IEvent } from "@/calendar/interfaces";

// Cache type
type FetchCache = {
  startDate: string;
  endDate: string;
  view: TCalendarView;
  userId: string;
  typeId: string;
  instrumentId: string;
  labId: number;
  events: IEvent[];
};

export const useFetchEvents = () => {
  const { selectedDate, selectedUserId, selectedTypeId, selectedInstrumentId, setLocalEvents } = useCalendar();
  const [loading, setLoading] = useState(false);
  const currentLabId = useCurrentLabId(); // Get current lab ID from context
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<TCalendarView>('month');
  
  // Keep a reference to the latest fetch to avoid race conditions
  const fetchCacheRef = useRef<FetchCache | null>(null);
  
  const getDateRange = useCallback((date: Date, viewType: TCalendarView) => {
    let startDate: Date;
    let endDate: Date;

    switch (viewType) {
      case "year":
        startDate = startOfYear(date);
        endDate = endOfYear(date);
        break;
      case "month":
      case "agenda":
        startDate = startOfMonth(date);
        endDate = endOfMonth(date);
        break;
      case "week":
        startDate = startOfWeek(date);
        endDate = endOfWeek(date);
        break;
      case "day":
        startDate = startOfDay(date);
        endDate = endOfDay(date);
        break;
      default:
        throw new Error(`Unsupported view: ${viewType}`);
    }
    
    return { startDate, endDate };
  }, []);
  
  const fetchEventsForDateRange = useCallback(async (
    date: Date, 
    viewType: TCalendarView, 
    userId: string, 
    typeId: string, 
    instrumentId: string,
    labId: number, 
    force = false
  ) => {
    const { startDate, endDate } = getDateRange(date, viewType);
    
    // Create a cache key
    const startKey = startDate.toISOString();
    const endKey = endDate.toISOString();
    
    // Check cache for existing data
    if (
      !force && 
      fetchCacheRef.current && 
      fetchCacheRef.current.startDate === startKey &&
      fetchCacheRef.current.endDate === endKey &&
      fetchCacheRef.current.view === viewType && 
      fetchCacheRef.current.userId === userId &&
      fetchCacheRef.current.typeId === typeId &&
      fetchCacheRef.current.labId === labId &&
      fetchCacheRef.current.instrumentId === instrumentId
    ) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching events for ${viewType} view from ${startDate.toDateString()} to ${endDate.toDateString()} for lab ${labId}`);
      
      const fetchedEvents = await getEvents(startDate, endDate, labId);
      
      // Filter events by user if needed - now checks assignments
      let filteredEvents = fetchedEvents;
      
      if (userId !== "all") {
        filteredEvents = filteredEvents.filter(event => {
          // If no assignments, check if the user is the assigner
          if (!event.assignments || event.assignments.length === 0) {
            return event.user.id === userId;
          }
          
          // Check if the user is in the assignments
          return event.assignments.some((assignment: any) => 
            assignment.memberId?.toString() === userId
          );
        });
      }
      
      // Filter events by type if needed
      if (typeId !== "all") {
        filteredEvents = filteredEvents.filter(event => 
          event.type && event.type.id.toString() === typeId
        );
      }
      
      // Filter events by instrument if needed
      if (instrumentId !== "all") {
        filteredEvents = filteredEvents.filter(event => {
          if (instrumentId === "none") {
            return !event.instrument || event.instrument === null;
          }
          return event.instrument && event.instrument.id.toString() === instrumentId;
        });
      }
      
      // Store in cache
      fetchCacheRef.current = {
        startDate: startKey,
        endDate: endKey,
        view: viewType,
        userId,
        typeId,
        instrumentId,
        labId,
        events: filteredEvents
      };
      
      setLocalEvents(filteredEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to fetch events. Please try again later.");
    } finally {
      setTimeout(() => setLoading(false), 0); // Ensure state update happens in next tick
    }
  }, [getDateRange, setLocalEvents]);
  
  // Fetch events when selected parameters change
  useEffect(() => {
    fetchEventsForDateRange(
      selectedDate, 
      view, 
      String(selectedUserId), 
      String(selectedTypeId),
      String(selectedInstrumentId),
      currentLabId
    );
  }, [selectedDate, view, selectedUserId, selectedTypeId, selectedInstrumentId, currentLabId, fetchEventsForDateRange]);
  
  return {
    loading,
    error,
    view,
    setView,
    refreshEvents: () => fetchEventsForDateRange(
      selectedDate, 
      view, 
      String(selectedUserId), 
      String(selectedTypeId),
      String(selectedInstrumentId),
      currentLabId,
      true
    )
  };
};