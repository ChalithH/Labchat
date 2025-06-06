"use client";

import { useState, useEffect, useCallback } from "react";
import { useCurrentLabId } from "@/contexts/lab-context";
import { getEvents, getUsers, getEventTypes, createEvent, updateEvent, deleteEvent } from "../requests";
import type { IEvent, IUser, IEventType, IUserSession } from "../interfaces";

export function useCalendarData() {
  const currentLabId = useCurrentLabId();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [eventTypes, setEventTypes] = useState<IEventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events for the current lab
  const fetchEvents = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      const eventsData = await getEvents(startDate, endDate, currentLabId);
      setEvents(eventsData);
      return eventsData;
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Failed to fetch events");
      return [];
    }
  }, [currentLabId]);

  // Fetch users for the current lab
  const fetchUsers = useCallback(async () => {
    try {
      const usersData = await getUsers(currentLabId);
      setUsers(usersData);
      return usersData;
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to fetch users");
      return [];
    }
  }, [currentLabId]);

  // Fetch event types
  const fetchEventTypes = useCallback(async () => {
    try {
      const typesData = await getEventTypes();
      setEventTypes(typesData);
      return typesData;
    } catch (err) {
      console.error("Failed to fetch event types:", err);
      setError("Failed to fetch event types");
      return [];
    }
  }, []);

  // Initialize data when lab changes
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchUsers(),
          fetchEventTypes()
        ]);
      } catch (err) {
        console.error("Failed to initialize calendar data:", err);
        setError("Failed to initialize calendar data");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [currentLabId, fetchUsers, fetchEventTypes]);

  // Wrapper functions that automatically use current lab context
  const createEventForCurrentLab = useCallback(async (event: Partial<IEvent>, currentUser: IUserSession) => {
    const result = await createEvent(event, currentUser);
    if (result) {
      setEvents(prev => [...prev, result]);
    }
    return result;
  }, []);

  const updateEventForCurrentLab = useCallback(async (event: IEvent) => {
    const result = await updateEvent(event);
    if (result) {
      setEvents(prev => prev.map(e => e.id === result.id ? result : e));
    }
    return result;
  }, []);

  const deleteEventForCurrentLab = useCallback(async (eventId: number) => {
    const success = await deleteEvent(eventId);
    if (success) {
      setEvents(prev => prev.filter(e => e.id !== eventId));
    }
    return success;
  }, []);

  return {
    currentLabId,
    events,
    users,
    eventTypes,
    loading,
    error,
    fetchEvents,
    fetchUsers,
    fetchEventTypes,
    createEvent: createEventForCurrentLab,
    updateEvent: updateEventForCurrentLab,
    deleteEvent: deleteEventForCurrentLab,
    setEvents,
  };
} 