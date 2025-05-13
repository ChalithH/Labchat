import type { TCalendarView } from "@/calendar/types";

/**
 * Detects the current calendar view from the URL path
 * @returns The current calendar view
 */
export function getCurrentViewFromURL(): TCalendarView {
  if (typeof window === 'undefined') return 'month';
  
  const path = window.location.pathname;
  if (path.includes('day-view')) return 'day';
  if (path.includes('week-view')) return 'week';
  if (path.includes('year-view')) return 'year';
  if (path.includes('agenda-view')) return 'agenda';
  return 'month';
}