"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { 
  Calendar, 
  Clock, 
  Text, 
  User, 
  Tag, 
  Microscope, 
  Users, 
  ArrowLeft,
  Edit,
  Trash2,
  AlertCircle,
  Building
} from "lucide-react";

import { CalendarProvider } from "@/calendar/contexts/calendar-context";
import { useUpdateEvent } from "@/calendar/hooks/use-update-event";
import { useDeleteEvent } from "@/calendar/hooks/use-delete-event";
import { EventBreadcrumb } from "@/calendar/components/single-event/event-breadcrumb";
import { EventShareButton } from "@/calendar/components/single-event/event-share-button";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EditEventDialog } from "@/calendar/components/dialogs/edit-event-dialog";
import { DeleteEventDialog } from "@/calendar/components/dialogs/delete-event-dialog";

import type { IEvent, IUser, IEventType, IInstrument, IEventStatus, ILabMember } from "@/calendar/interfaces";

interface SingleEventClientProps {
  event: IEvent;
  users: IUser[];
  eventTypes: IEventType[];
  instruments: IInstrument[];
  statuses: IEventStatus[];
  currentUser: ILabMember;
}

export function SingleEventClient({ 
  event: initialEvent, 
  users, 
  eventTypes, 
  instruments, 
  statuses,
  currentUser
}: SingleEventClientProps) {
  const router = useRouter();
  const [event, setEvent] = useState(initialEvent);
  const { updateEvent, isUpdating, error: updateError } = useUpdateEvent();
  const { removeEvent, isDeleting, error: deleteError } = useDeleteEvent();

  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);

  // Get the type name with proper formatting
  const typeName = event.type?.name || "Event";

  const handleEventDelete = async () => {
    const success = await removeEvent(event.id);
    if (success) {
      // Redirect back to calendar after successful deletion
      router.push('/calendar/month-view');
    }
  };

  const handleBackToCalendar = () => {
    router.back();
  };

  return (
    <CalendarProvider 
      users={users} 
      eventTypes={eventTypes} 
      instruments={instruments}
      initialEvents={[event]}
      statuses={statuses}
      currentUser={currentUser}
    >
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {/* Breadcrumb */}
        <EventBreadcrumb event={event} />
        
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBackToCalendar}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Calendar
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <EventShareButton 
              eventId={event.id} 
              eventTitle={event.title} 
            />
            
            <EditEventDialog 
              event={event}
            >
              <Button variant="outline" size="sm" disabled={isUpdating || isDeleting}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </EditEventDialog>

            <DeleteEventDialog 
              event={event}
              onDeleted={handleEventDelete}
            >
              <Button variant="destructive" size="sm" disabled={isUpdating || isDeleting}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </DeleteEventDialog>
          </div>
        </div>

        {/* Error messages */}
        {(updateError || deleteError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {updateError || deleteError}
            </AlertDescription>
          </Alert>
        )}

        {/* Main event details */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left column - Main details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Event Information
                </CardTitle>
              </CardHeader>
              {event.lab && (
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-muted p-2">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{event.lab.name}</p>
                      <p className="text-sm text-muted-foreground">Laboratory</p>
                    </div>
                  </div>
                </CardContent>
                )}
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Tag className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Type</p>
                    <Badge 
                      className="text-white border-0 font-medium"
                      style={{
                        backgroundColor: event.type?.color || event.color,
                        color: 'white'
                      }}
                    >
                      {typeName}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Text className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-muted-foreground">
                      {event.description || "No description provided"}
                    </p>
                  </div>
                </div>

                {event.status && (
                  <div className="flex items-start gap-3">
                    <Tag className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <Badge className="capitalize bg-black text-white border-black">
                        {event.status.name}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
              
            </Card>

            {/* Date and Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Start Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {format(startDate, "EEEE, MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">End Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {format(endDate, "EEEE, MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} day(s), {' '}
                      {Math.round(((endDate.getTime() - startDate.getTime()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))} hour(s)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Assigner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{event.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{event.user.name}</p>
                    <p className="text-sm text-muted-foreground">Event Creator</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignments */}
            {event.assignments && event.assignments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Assigned Members ({event.assignments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {event.assignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {assignment.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{assignment.name}</p>
                          <p className="text-xs text-muted-foreground">Lab Member</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instrument */}
            {event.instrument && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Microscope className="h-5 w-5" />
                    Instrument
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-muted p-2">
                      <Microscope className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {event.instrument.name || "Unnamed Instrument"}
                      </p>
                      <p className="text-sm text-muted-foreground">Equipment Booking</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
          </div>
        </div>
      </div>
    </CalendarProvider>
  );
}