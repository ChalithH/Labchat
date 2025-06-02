"use client";

import { format, parseISO } from "date-fns";
import { Calendar, Clock, Text, User, Tag, Microscope, Users, Edit, Trash2, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EditEventDialog } from "@/calendar/components/dialogs/edit-event-dialog";
import { DeleteEventDialog } from "@/calendar/components/dialogs/delete-event-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EventLink } from "@/calendar/components/event-link";

import type { IEvent } from "@/calendar/interfaces";

interface IProps {
  event: IEvent;
  children: React.ReactNode;
}

export function EventDetailsDialog({ event, children }: IProps) {
  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);

  // Get the type name with proper formatting
  const typeName = event.type?.name || "Event";
  
  // Determine the badge variant based on the event color
  const getBadgeVariant = (color: string) => {
    if (color === "blue") return "default";
    if (color === "purple") return "secondary";
    return "outline";
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent className="max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{event.title}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(80vh-160px)] pr-4">
            <div className="space-y-4 py-2">
              {/* Assigner */}
              <div className="flex items-start gap-2">
                <User className="mt-1 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">Assigner</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">{event.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-muted-foreground">{event.user.name}</p>
                  </div>
                </div>
              </div>

              {/* Assignments (if available) */}
              {event.assignments && event.assignments.length > 0 && (
                <div className="flex items-start gap-2">
                  <Users className="mt-1 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Assigned Members</p>
                    <div className="space-y-1 mt-1">
                      {event.assignments.map((assignment) => (
                        <div key={assignment.id} className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">{assignment.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">{assignment.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Instrument (if available) */}
              {event.instrument && (
                <div className="flex items-start gap-2">
                  <Microscope className="mt-1 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Instrument</p>
                    <p className="text-sm text-muted-foreground">{event.instrument.name || "Unnamed Instrument"}</p>
                  </div>
                </div>
              )}

              {/* Type */}
              <div className="flex items-start gap-2">
                <Tag className="mt-1 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <Badge variant={getBadgeVariant(event.color)}>
                    {typeName}
                  </Badge>
                </div>
              </div>

              {/* Lab (if available) */}
              {event.lab && (
                <div className="flex items-start gap-2">
                  <Calendar className="mt-1 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Lab</p>
                    <p className="text-sm text-muted-foreground">{event.lab.name}</p>
                  </div>
                </div>
              )}

              {/* Date & Time info */}
              <div className="flex items-start gap-2">
                <Calendar className="mt-1 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">Start Date</p>
                  <p className="text-sm text-muted-foreground">{format(startDate, "MMM d, yyyy h:mm a")}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="mt-1 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">End Date</p>
                  <p className="text-sm text-muted-foreground">{format(endDate, "MMM d, yyyy h:mm a")}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Text className="mt-1 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground">{event.description || "No description provided"}</p>
                </div>
              </div>

              {/* Status (if available) */}
              {event.status && (
                <div className="flex items-start gap-2">
                  <Tag className="mt-1 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant="outline" className="capitalize">
                      {event.status}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="flex flex-col-reverse gap-2 justify-end">
            <div className="flex gap-2">
              <EventLink eventId={event.id}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Event Page
              </EventLink>
              <DeleteEventDialog event={event}>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </DeleteEventDialog>
              
              <EditEventDialog event={event}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </EditEventDialog>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}