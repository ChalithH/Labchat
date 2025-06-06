export interface IUser {
  id: string;
  name: string;
  picturePath: string | null;
}

export interface ILabMember {
  id: string;
  userId: string;
  labRoleId: string;
  labId: string;
  picturePath: string | null;
  name: string;
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
  color?: string;
}

export interface IEventStatus {
  id: number;
  name: string;
  color?: string;
  description?: string;
}

export interface IEvent {
  id: number;
  startDate: string;
  endDate: string;
  title: string;
  color: string;
  description: string;
  status?: IEventStatus | null;
  user: IUser;  // This is the assigner
  type?: IEventType;
  instrument?: IInstrument | null;
  lab?: ILab;
  assignments?: IAssignment[];
  assignedUserIds?: string[];
}

export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}