"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Plus, X, Microscope, ChevronDown, ChevronUp, Repeat, Calendar as CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";

import { useDisclosure } from "@/hooks/use-disclosure";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useAddEvent } from "@/calendar/hooks/use-add-event";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

import { eventSchema } from "@/calendar/schemas";
import { recurringEventSchema } from "@/calendar/schemas";

import type { TimeValue } from "react-aria-components";
import type { TEventFormData } from "@/calendar/schemas";
import type { IAssignment, IEventType } from "@/calendar/interfaces";
import type { TRecurringEventFormData } from "@/calendar/schemas";

interface IProps {
  children: React.ReactNode;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
}

export function AddEventDialog({ children, startDate, startTime }: IProps) {
  const { users, eventTypes: contextEventTypes, instruments, currentUser } = useCalendar();
  const { addEvent, addRecurringEvents, isAdding, error: addError } = useAddEvent();
  const { isOpen, onClose, onToggle } = useDisclosure();
  
  // State for managing event types
  const [eventTypes, setEventTypes] = useState<IEventType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  
  // State for managing assigned members
  const [selectedAssignees, setSelectedAssignees] = useState<IAssignment[]>([]);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  const [isRecurringExpanded, setIsRecurringExpanded] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  
  // State for preview of recurring events
  const [recurringPreview, setRecurringPreview] = useState<Date[]>([]);


  // Fetch event types on component mount or use context event types if available
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

 const form = useForm<TRecurringEventFormData>({
    resolver: zodResolver(recurringEventSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: typeof startDate !== "undefined" ? startDate : undefined,
      startTime: typeof startTime !== "undefined" ? startTime : undefined,
      endDate: typeof startDate !== "undefined" 
        ? new Date(startDate.getTime() + (startTime?.hour === 23 ? 24 * 60 * 60 * 1000 : 0)) 
        : undefined,
      endTime: typeof startTime !== "undefined" 
        ? { 
            hour: (startTime.hour + 1) % 24, 
            minute: startTime.minute 
          } 
        : undefined,
      type: "1", // Default type ID as string
      instrumentId: null, // Default to no instrument
      user: "", // Will be set in useEffect
      isRecurring: false,
      frequency: "daily", // Default frequency
      repetitions: 1, 
    },
  });

  // Set the current user when users data is available
  useEffect(() => {
    const getCurrentUserId = () => {
      console.log("currentUser:", currentUser);
      if (currentUser && users && users.length > 0) {
        // Find the user that matches the current lab member's userId
        const matchingUser = users.find(user => user.id === currentUser.id);
        return matchingUser?.id || users[0]?.id;
      }
      return users && users.length > 0 ? users[0]?.id : "";
    };
    
    const currentUserId = getCurrentUserId();
    if (currentUserId && currentUserId !== form.getValues("user")) {
      form.setValue("user", currentUserId);
    }
  }, [users, currentUser, form]);

  // Watch form values for recurring preview
  const watchedStartDate = form.watch("startDate");
  const watchedFrequency = form.watch("frequency");
  const watchedRepetitions = form.watch("repetitions");

  // Generate preview of recurring event dates
  useEffect(() => {
    if (!isRecurring || !watchedStartDate || !watchedFrequency || !watchedRepetitions) {
      setRecurringPreview([]);
      return;
    }

    const dates: Date[] = [];
    const startDate = new Date(watchedStartDate);
    
    for (let i = 0; i < Math.min(watchedRepetitions, 10); i++) { // Limit preview to 10 events
      const eventDate = new Date(startDate);
      
      switch (watchedFrequency) {
        case 'daily':
          eventDate.setDate(startDate.getDate() + i);
          break;
        case 'weekly':
          eventDate.setDate(startDate.getDate() + (i * 7));
          break;
        case 'monthly':
          eventDate.setMonth(startDate.getMonth() + i);
          break;
      }
      
      dates.push(eventDate);
    }
    
    setRecurringPreview(dates);
  }, [isRecurring, watchedStartDate, watchedFrequency, watchedRepetitions]);

  const onSubmit = async (values: TRecurringEventFormData) => {
    const startDateTime = new Date(values.startDate);
    startDateTime.setHours(values.startTime.hour, values.startTime.minute);

    const endDateTime = new Date(values.endDate);
    endDateTime.setHours(values.endTime.hour, values.endTime.minute);

    const user = users.find(user => user.id === values.user);
    if (!user) throw new Error("User not found");

    // Find the selected event type
    const selectedType = eventTypes.find(type => type.id.toString() === values.type);

    // Find the selected instrument if any
    const selectedInstrument = values.instrumentId && values.instrumentId !== "none" 
      ? instruments.find(i => i.id.toString() === values.instrumentId)
      : null;

    // Prepare assignments with proper member IDs
    const assignmentsWithMemberIds = selectedAssignees.map(assignee => ({
      ...assignee,
      memberId: typeof assignee.memberId === 'number' ? assignee.memberId : parseInt(assignee.memberId as unknown as string)
    }));

    const eventData = {
      title: values.title,
      description: values.description,
      color: selectedType?.color || "#10B981", // Use hex color from type or default to green
      user,
      type: selectedType,
      instrument: selectedInstrument,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      assignments: assignmentsWithMemberIds,
    };

    let result: boolean;

    if (values.isRecurring) {
      // Create recurring events
      result = await addRecurringEvents(eventData, values.frequency, values.repetitions);
    } else {
      // Create single event
      result = await addEvent(eventData);
    }
    

    if (result) {
      onClose();
      form.reset({
        title: "",
        description: "",
        startDate: typeof startDate !== "undefined" ? startDate : undefined,
        startTime: typeof startTime !== "undefined" ? startTime : undefined,
        endDate: typeof startDate !== "undefined" 
          ? new Date(startDate.getTime() + (startTime?.hour === 23 ? 24 * 60 * 60 * 1000 : 0)) 
          : undefined,
        endTime: typeof startTime !== "undefined" 
          ? { 
              hour: (startTime.hour + 1) % 24, 
              minute: startTime.minute 
            } 
          : undefined,
        type: "1",
        instrumentId: null,
        user: currentUser && users?.find(user => user.id === currentUser.id)?.id || (users && users.length > 0 ? users[0]?.id : ""), // Reset to current user
      });
      setSelectedAssignees([]);
      setIsRecurring(false);
      setIsRecurringExpanded(false);
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
        name: user.name,
        picturePath: user.picturePath || null, // Use user's picture if available
      }
    ]);
  };
  
  // Function to remove an assignee
  const handleRemoveAssignee = (id: number) => {
    setSelectedAssignees(selectedAssignees.filter(a => a.id !== id));
  };

  // Get currently selected type ID
  const currentTypeId = form.watch("type");
  const currentType = eventTypes.find(t => t.id.toString() === currentTypeId);
  const isEquipmentType = currentType?.name?.toLowerCase().includes("equipment") || 
                         currentType?.name?.toLowerCase().includes("booking");
  
  // Reset assignments when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsRecurringExpanded(false);
      setIsRecurring(false);
      setSelectedAssignees([]);
    }
    onToggle();
  };

  // Deal with empty users list case
  const hasUsers = users && users.length > 0;
  const firstUserId = hasUsers ? users[0]?.id : "";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[85vh] py-3 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Add New Event</DialogTitle>
          <DialogDescription className="text-gray-600">
            Input values to create a task/booking. Fill in all required fields to create a calendar event.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-160px)]">
          <div className="px-1 pr-4">
            <Form {...form}>
              <form id="event-form" onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                {addError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{addError}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="user"
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-gray-900">Assigner</FormLabel>
                      <FormControl>
                        <Select value={field.value} disabled>
                          <SelectTrigger data-invalid={fieldState.invalid} className="opacity-75">
                            <SelectValue placeholder="Select assigner" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={user.picturePath || undefined} />
                                    <AvatarFallback className="text-[10px] bg-gray-100 text-gray-700">
                                      {user.name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-gray-900">{user.name}</span>
                                  {currentUser && user.id === currentUser.id && (
                                    <span className="text-xs text-blue-600 font-medium">(You)</span>
                                  )}
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

                <div className="flex justify-between items-center gap-2">
                  {/* Event Type Selection */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field, fieldState }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-gray-900">Event Type (Required)</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange} disabled={loadingTypes}>
                            <SelectTrigger className="w-full" data-invalid={fieldState.invalid}>
                              <SelectValue placeholder={loadingTypes ? "Loading types..." : "Select event type"} />
                            </SelectTrigger>
                            <SelectContent>
                              {eventTypes.map(type => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="size-3.5 rounded-full" 
                                      style={{ backgroundColor: type.color || '#10B981' }}
                                    />
                                    <span className="text-gray-900">{type.name}</span>
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

                  {/* Instrument Selection */}
                  <FormField
                    control={form.control}
                    name="instrumentId"
                    render={({ field, fieldState }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-gray-900">Instrument</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value !== null ? field.value : "none"}
                            onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                          >
                            <SelectTrigger className="w-full" data-invalid={fieldState.invalid}>
                              <SelectValue placeholder="Select an instrument" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">No instrument</span>
                                </div>
                              </SelectItem>
                              {instruments.map(instrument => (
                                <SelectItem key={instrument.id} value={instrument.id.toString()}>
                                  <div className="flex items-center gap-2">
                                    <Microscope className="h-4 w-4 text-gray-600" />
                                    <span className="text-gray-900">{instrument.name}</span>
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
                </div>

                {/* Assignees section */}
                <div className="space-y-3 border rounded-md p-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-900">Assigned Members</h3>
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
                                  <AvatarImage src={user.picturePath || undefined} />
                                  <AvatarFallback className="text-[10px] bg-gray-100 text-gray-700">{user.name[0]}</AvatarFallback>
                                </Avatar>
                                <span className="truncate text-gray-900">{user.name}</span>
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
                    <p className="text-xs text-gray-600 italic">No members assigned yet</p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      {selectedAssignees.map(assignee => (
                        <div key={assignee.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={assignee.picturePath || undefined} />
                              <AvatarFallback className="bg-gray-100 text-gray-700">{assignee.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-900">{assignee.name}</span>
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

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel htmlFor="title" className="text-gray-900">Title (Required)</FormLabel>

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
                        <FormLabel htmlFor="startDate" className="text-gray-900">Start Date (Required)</FormLabel>

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
                        <FormLabel className="text-gray-900">Start Time (Required)</FormLabel>

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
                        <FormLabel className="text-gray-900">End Date (Required)</FormLabel>
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
                        <FormLabel className="text-gray-900">End Time (Required)</FormLabel>

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
                      <FormLabel className="text-gray-900">Description (Required)</FormLabel>

                      <FormControl>
                        <Textarea {...field} value={field.value} data-invalid={fieldState.invalid} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                
                {/* Recurring Events Section */}
                <Collapsible open={isRecurringExpanded} onOpenChange={setIsRecurringExpanded}>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Repeat className="h-4 w-4" />
                        <span>Recurring Events</span>
                        {isRecurring && (
                          <Badge variant="secondary" className="ml-2">
                            {form.watch("frequency")} × {form.watch("repetitions")}
                          </Badge>
                        )}
                      </div>
                      {isRecurringExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-4 mt-4 p-4 border rounded-md bg-gray-50">
                    <FormField
                      control={form.control}
                      name="isRecurring"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={isRecurring}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setIsRecurring(checked);
                                field.onChange(checked);
                              }}
                              className="h-4 w-4"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Create recurring events
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    {isRecurring && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="frequency"
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormLabel className="text-gray-900">Frequency</FormLabel>
                                <FormControl>
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger data-invalid={fieldState.invalid}>
                                      <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="daily">Daily</SelectItem>
                                      <SelectItem value="weekly">Weekly</SelectItem>
                                      <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="repetitions"
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormLabel className="text-gray-900">Repetitions</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="365"
                                    placeholder="Number of events"
                                    data-invalid={fieldState.invalid}
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Preview of recurring events */}
                        {recurringPreview.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">Preview ({recurringPreview.length}{watchedRepetitions > 10 ? ` of ${watchedRepetitions}` : ''} events):</span>
                            </div>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {recurringPreview.map((date, index) => (
                                <div key={index} className="text-xs bg-white p-2 rounded border">
                                  Event {index + 1}: {date.toLocaleDateString()}
                                </div>
                              ))}
                              {watchedRepetitions > 10 && (
                                <div className="text-xs text-gray-500 italic p-2">
                                  ... and {watchedRepetitions - 10} more events
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </CollapsibleContent>
                </Collapsible>
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

          <Button form="event-form" type="submit" disabled={isAdding}>
            {isAdding ? "Creating..." : "Create Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}