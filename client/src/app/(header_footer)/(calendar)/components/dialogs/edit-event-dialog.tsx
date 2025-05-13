"use client";

import { parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Users, Microscope } from "lucide-react";

import { useDisclosure } from "@/hooks/use-disclosure";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useUpdateEvent } from "@/calendar/hooks/use-update-event";
import { eventTypeColors } from "@/calendar/requests";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TimeInput } from "@/components/ui/time-input";
import { SingleDayPicker } from "@/components/ui/single-day-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormField, FormLabel, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogHeader, DialogClose, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { eventSchema } from "@/calendar/schemas";

import type { IEvent } from "@/calendar/interfaces";
import type { TimeValue } from "react-aria-components";
import type { TEventFormData } from "@/calendar/schemas";

interface IProps {
  children: React.ReactNode;
  event: IEvent;
}

export function EditEventDialog({ children, event }: IProps) {
  const { isOpen, onClose, onToggle } = useDisclosure();

  const { users } = useCalendar();

  const { updateEvent, isUpdating, error: updateError } = useUpdateEvent();

  // Find the event type based on color
  // This must match one of the enum values: "rostering" | "equipment" | "default"
  const eventType = (Object.entries(eventTypeColors).find(([, color]) => color === event.color)?.[0] || "default") as "rostering" | "equipment" | "default";

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      user: event.user.id,
      title: event.title,
      description: event.description,
      startDate: parseISO(event.startDate),
      startTime: { hour: parseISO(event.startDate).getHours(), minute: parseISO(event.startDate).getMinutes() },
      endDate: parseISO(event.endDate),
      endTime: { hour: parseISO(event.endDate).getHours(), minute: parseISO(event.endDate).getMinutes() },
      type: eventType,
      color: event.color,
    },
  });

  const onSubmit = async (values: TEventFormData) => {
    const user = users.find(user => user.id === values.user);

    if (!user) throw new Error("User not found");

    const startDateTime = new Date(values.startDate);
    startDateTime.setHours(values.startTime.hour, values.startTime.minute);

    const endDateTime = new Date(values.endDate);
    endDateTime.setHours(values.endTime.hour, values.endTime.minute);

    // Map type to color
    const color = values.type && eventTypeColors[values.type] 
      ? eventTypeColors[values.type]
      : eventTypeColors.default;

    const result = await updateEvent({
      ...event,
      user,
      title: values.title,
      description: values.description,
      color,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
    });

    if (result) {
      onClose();
    }
  };

  const hasAssignments = event.assignments && event.assignments.length > 0;
  const hasInstrument = !!event.instrument;

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Update the event details below
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(80vh-160px)]">
          <div className="pr-4">
            <Form {...form}>
              <form id="event-form" onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                {updateError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{updateError}</AlertDescription>
                  </Alert>
                )}
                
                <FormField
                  control={form.control}
                  name="user"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Assigner</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-invalid={fieldState.invalid}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>

                          <SelectContent>
                            {users.map(user => (
                              <SelectItem key={user.id} value={user.id} className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Avatar key={user.id} className="size-6">
                                    <AvatarImage src={user.picturePath ?? undefined} alt={user.name} />
                                    <AvatarFallback className="text-xxs">{user.name[0]}</AvatarFallback>
                                  </Avatar>

                                  <p className="truncate">{user.name}</p>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Display current assigned members as read-only info */}
                {hasAssignments && (
                  <div className="rounded-md border p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Assigned Members</p>
                    </div>
                    <div className="pl-6 space-y-2">
                      {(event.assignments ?? []).map(assignment => (
                        <div key={assignment.id} className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[10px]">{assignment.name[0]}</AvatarFallback>
                          </Avatar>
                          <p className="text-sm text-muted-foreground">{assignment.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Display instrument info as read-only */}
                {hasInstrument && (
                  <div className="rounded-md border p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Microscope className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Instrument</p>
                    </div>
                    <p className="pl-6 text-sm text-muted-foreground">{event.instrument?.name || "N/A"}</p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel htmlFor="title">Title</FormLabel>

                      <FormControl>
                        <Input id="title" placeholder="Enter a title" data-invalid={fieldState.invalid} {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field, fieldState }) => (
                      <FormItem className="flex-1">
                        <FormLabel htmlFor="startDate">Start Date</FormLabel>

                        <FormControl>
                          <SingleDayPicker
                            id="startDate"
                            value={field.value}
                            onSelect={date => field.onChange(date as Date)}
                            placeholder="Select a date"
                            data-invalid={fieldState.invalid}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field, fieldState }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Start Time</FormLabel>

                        <FormControl>
                          <TimeInput value={field.value as TimeValue} onChange={field.onChange} hourCycle={12} data-invalid={fieldState.invalid} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field, fieldState }) => (
                      <FormItem className="flex-1">
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <SingleDayPicker
                            value={field.value}
                            onSelect={date => field.onChange(date as Date)}
                            placeholder="Select a date"
                            data-invalid={fieldState.invalid}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field, fieldState }) => (
                      <FormItem className="flex-1">
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <TimeInput value={field.value as TimeValue} onChange={field.onChange} hourCycle={12} data-invalid={fieldState.invalid} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-invalid={fieldState.invalid}>
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="rostering">
                              <div className="flex items-center gap-2">
                                <div className="size-3.5 rounded-full bg-blue-600" />
                                Rostering
                              </div>
                            </SelectItem>

                            <SelectItem value="equipment">
                              <div className="flex items-center gap-2">
                                <div className="size-3.5 rounded-full bg-green-600" />
                                Equipment
                              </div>
                            </SelectItem>

                            <SelectItem value="default">
                              <div className="flex items-center gap-2">
                                <div className="size-3.5 rounded-full bg-purple-600" />
                                Other
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>

                      <FormControl>
                        <Textarea {...field} value={field.value} data-invalid={fieldState.invalid} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </ScrollArea>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>

          <Button form="event-form" type="submit" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}