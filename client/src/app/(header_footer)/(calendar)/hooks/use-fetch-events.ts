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
  labId: number; 
  events: IEvent[];
};

export const useFetchEvents = () => {
  const { 
    selectedDate, 
    setLocalEvents 
  } = useCalendar();
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
      fetchCacheRef.current.labId === labId 
    ) {
      // Use cached events but still set them in state
      setLocalEvents(fetchCacheRef.current.events);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching events for ${viewType} view from ${startDate.toDateString()} to ${endDate.toDateString()} for lab ${labId}`);
      
      const fetchedEvents = await getEvents(startDate, endDate, labId);
      
      // Store in cache
      fetchCacheRef.current = {
        startDate: startKey,
        endDate: endKey,
        view: viewType,
        events: fetchedEvents,
        labId: labId
      };
      
      setLocalEvents(fetchedEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to fetch events. Please try again later.");
    } finally {
      setTimeout(() => setLoading(false), 0); // Ensure state update happens in next tick
    }
  }, [getDateRange, setLocalEvents]);
  
  useEffect(() => {
    fetchEventsForDateRange(
      selectedDate, 
      view, 
      currentLabId
    );
  }, [selectedDate, view, currentLabId, fetchEventsForDateRange]);
  
  return {
    loading,
    error,
    view,
    setView,
    refreshEvents: () => fetchEventsForDateRange(
      selectedDate, 
      view, 
      currentLabId,
      true
    )
  };
};