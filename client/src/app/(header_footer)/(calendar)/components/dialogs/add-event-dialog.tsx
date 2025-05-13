"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Plus, X } from "lucide-react";
import { useState } from "react";

import { useDisclosure } from "@/hooks/use-disclosure";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useAddEvent } from "@/calendar/hooks/use-add-event";
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

import type { TimeValue } from "react-aria-components";
import type { TEventFormData } from "@/calendar/schemas";
import type { IAssignment } from "@/calendar/interfaces";

interface IProps {
  children: React.ReactNode;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
}

export function AddEventDialog({ children, startDate, startTime }: IProps) {
  const { users } = useCalendar();
  const { addEvent, isAdding, error: addError } = useAddEvent();

  const { isOpen, onClose, onToggle } = useDisclosure();
  
  // State for managing assigned members
  const [selectedAssignees, setSelectedAssignees] = useState<IAssignment[]>([]);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
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
      type: "rostering", // Default type
      color: "blue" // Default color for rostering
    },
  });

  const onSubmit = async (values: TEventFormData) => {
    const startDateTime = new Date(values.startDate);
    startDateTime.setHours(values.startTime.hour, values.startTime.minute);

    const endDateTime = new Date(values.endDate);
    endDateTime.setHours(values.endTime.hour, values.endTime.minute);

    const user = users.find(user => user.id === values.user);
    if (!user) throw new Error("User not found");

    // Map type to color
    const color = values.type && eventTypeColors[values.type] 
      ? eventTypeColors[values.type]
      : eventTypeColors.default;

    const result = await addEvent({
      title: values.title,
      description: values.description,
      color,
      user,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      assignments: selectedAssignees,
    });

    if (result) {
      onClose();
      form.reset();
      setSelectedAssignees([]);
    }
  };
  
  // Function to add an assignee
  const handleAddAssignee = (userId: string) => {
    setAssignmentError(null);
    
    // Find the user
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    // Check if already assigned
    const alreadyAssigned = selectedAssignees.some(a => a.memberId === parseInt(user.id));
    if (alreadyAssigned) {
      setAssignmentError("This user is already assigned");
      return;
    }
    
    // Add to assigned list
    setSelectedAssignees([
      ...selectedAssignees,
      {
        id: Date.now(), // Temporary ID
        memberId: parseInt(user.id),
        name: user.name
      }
    ]);
  };
  
  // Function to remove an assignee
  const handleRemoveAssignee = (id: number) => {
    setSelectedAssignees(selectedAssignees.filter(a => a.id !== id));
  };

  // Get value of currently selected type for conditional rendering
  const currentType = form.watch("type");
  
  // Reset assignments when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedAssignees([]);
    }
    onToggle();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
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
                    <FormItem>
                      <FormLabel>Assigner (Required)</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-invalid={fieldState.invalid}>
                            <SelectValue placeholder="Select who is creating this event" />
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

                {/* Assignees section - only show for rostering events */}
                {currentType === "rostering" && (
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
                          onClick={() => handleAddAssignee(users[0]?.id)}
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

                {/* Instrument selector would go here for equipment events */}
                {currentType === "equipment" && (
                  <div className="border rounded-md p-3">
                    <h3 className="text-sm font-medium mb-2">Instrument</h3>
                    <p className="text-xs text-muted-foreground italic">
                      Instrument selection is not available in this form. Instruments will be assigned through the backend system.
                    </p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel htmlFor="title">Title (Required)</FormLabel>

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
                        <FormLabel htmlFor="startDate">Start Date (Required)</FormLabel>

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
                        <FormLabel>Start Time (Required)</FormLabel>

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
                        <FormLabel>End Date (Required)</FormLabel>
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
                        <FormLabel>End Time (Required)</FormLabel>

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
                      <FormLabel>Event Type (Required)</FormLabel>
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
                      <FormLabel>Description (Required)</FormLabel>

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

          <Button form="event-form" type="submit" disabled={isAdding}>
            {isAdding ? "Creating..." : "Create Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}