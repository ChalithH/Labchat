"use client";

import { parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Users, Microscope, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";

import { useDisclosure } from "@/hooks/use-disclosure";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useUpdateEvent } from "@/calendar/hooks/use-update-event";
import { getEventTypes } from "@/calendar/requests";

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

import type { IEvent, IEventType, IAssignment } from "@/calendar/interfaces";
import type { TimeValue } from "react-aria-components";
import type { TEventFormData } from "@/calendar/schemas";

interface IProps {
  children: React.ReactNode;
  event: IEvent;
}

export function EditEventDialog({ children, event }: IProps) {
  const { isOpen, onClose, onToggle } = useDisclosure();

  const { users, eventTypes: contextEventTypes } = useCalendar();
  const { updateEvent, isUpdating, error: updateError } = useUpdateEvent();
  
  // State for event types
  const [eventTypes, setEventTypes] = useState<IEventType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  
  // State for managing assigned members
  const [selectedAssignees, setSelectedAssignees] = useState<IAssignment[]>(event.assignments || []);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  // Fetch event types when the component mounts or use context event types if available
  useEffect(() => {
    if (contextEventTypes && contextEventTypes.length > 0) {
      setEventTypes(contextEventTypes);
      return;
    }
    
    const fetchEventTypes = async () => {
      setLoadingTypes(true);
      try {
        const types = await getEventTypes();
        setEventTypes(types);
      } catch (error) {
        console.error("Error fetching event types:", error);
      } finally {
        setLoadingTypes(false);
      }
    };
    
    fetchEventTypes();
  }, [contextEventTypes]);

  // Find the event type ID
  const initialTypeId = event.type?.id.toString() || "1";
  
  // Initialize with existing assignments if any
  useEffect(() => {
    if (event.assignments && event.assignments.length > 0) {
      setSelectedAssignees(event.assignments);
    }
  }, [event.assignments]);

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
      type: initialTypeId,
    },
  });

  const onSubmit = async (values: TEventFormData) => {
    const user = users.find(user => user.id === values.user);

    if (!user) throw new Error("User not found");

    const startDateTime = new Date(values.startDate);
    startDateTime.setHours(values.startTime.hour, values.startTime.minute);

    const endDateTime = new Date(values.endDate);
    endDateTime.setHours(values.endTime.hour, values.endTime.minute);

    // Find the selected event type
    const selectedType = eventTypes.find(type => type.id.toString() === values.type);

    // Prepare assignments with proper member IDs
    const assignmentsWithMemberIds = selectedAssignees.map(assignee => ({
      ...assignee,
      memberId: typeof assignee.memberId === 'number' ? assignee.memberId : parseInt(assignee.memberId as unknown as string)
    }));

    const result = await updateEvent({
      ...event,
      user,
      title: values.title,
      description: values.description,
      color: selectedType?.color || "green", // Use color from type or default to green
      type: selectedType,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      assignments: assignmentsWithMemberIds,
    });

    if (result) {
      onClose();
    }
  };

  // Function to add an assignee
  const handleAddAssignee = (userId: string) => {
    setAssignmentError(null);
    
    // Find the user
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    // Check if already assigned
    const userIdAsNumber = typeof user.id === 'string' ? parseInt(user.id) : user.id;
    const alreadyAssigned = selectedAssignees.some(a => a.memberId === userIdAsNumber);
    
    if (alreadyAssigned) {
      setAssignmentError("This user is already assigned");
      return;
    }
    
    // Add to assigned list
    setSelectedAssignees([
      ...selectedAssignees,
      {
        id: Date.now(), // Temporary ID
        memberId: userIdAsNumber,
        name: user.name
      }
    ]);
  };
  
  // Function to remove an assignee
  const handleRemoveAssignee = (id: number) => {
    setSelectedAssignees(selectedAssignees.filter(a => a.id !== id));
  };

  // Get the current type ID
  const currentTypeId = form.watch("type");
  const currentType = eventTypes.find(t => t.id.toString() === currentTypeId);
  const isEquipmentType = currentType?.name?.toLowerCase().includes("equipment") || 
                           currentType?.name?.toLowerCase().includes("booking");

  // Deal with empty users list case
  const hasUsers = users && users.length > 0;
  const firstUserId = hasUsers ? users[0]?.id : "";
  
  const hasAssignments = selectedAssignees && selectedAssignees.length > 0;
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

                {/* Event Type Selection */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                          disabled={loadingTypes}
                        >
                          <SelectTrigger data-invalid={fieldState.invalid}>
                            <SelectValue placeholder={loadingTypes ? "Loading types..." : "Select event type"} />
                          </SelectTrigger>

                          <SelectContent>
                            {eventTypes.map(type => (
                              <SelectItem key={type.id} value={type.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <div className={`size-3.5 rounded-full bg-${type.color || 'green'}-600`} />
                                  {type.name}
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

                {/* Assignees management section - only show for non-equipment events */}
                {!isEquipmentType && hasUsers && (
                  <div className="space-y-3 border rounded-md p-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Assigned Members</h3>
                      <div className="flex gap-2 items-center">
                        <Select onValueChange={handleAddAssignee}>
                          <SelectTrigger className="w-[180px] h-8">
                            <SelectValue placeholder="Add member" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarFallback className="text-[10px]">{user.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <span className="truncate">{user.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => handleAddAssignee(firstUserId)}
                          disabled={!firstUserId}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {assignmentError && (
                      <p className="text-xs text-destructive">{assignmentError}</p>
                    )}
                    
                    {selectedAssignees.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No members assigned yet</p>
                    ) : (
                      <div className="space-y-2 mt-2">
                        {selectedAssignees.map(assignee => (
                          <div key={assignee.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>{assignee.name[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{assignee.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleRemoveAssignee(assignee.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
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