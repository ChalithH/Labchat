import type { TEventColor } from "@/calendar/types";

export interface IUser {
  id: string;
  name: string;
  picturePath: string | null;
}

export interface IInstrument {
  id: number;
  name: string | null;
}

export interface ILab {
  id: number;
  name: string;
}

export interface IAssignment {
  id: number;
  memberId?: number;
  name: string;
}

export interface IEventType {
  id: number;
  name: string;
  color?: TEventColor;
}

export interface IEvent {
  id: number;
  startDate: string;
  endDate: string;
  title: string;
  color: TEventColor;
  description: string;
  status?: string | null;
  user: IUser;  // This is the assigner
  type?: IEventType;
  instrument?: IInstrument | null;
  lab?: ILab;
  assignments?: IAssignment[];
}

export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}
