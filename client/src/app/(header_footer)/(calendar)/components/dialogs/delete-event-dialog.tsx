"use client";

import { useState } from "react";
import { AlertCircle, Trash2 } from "lucide-react";

import { useDisclosure } from "@/hooks/use-disclosure";
import { useDeleteEvent } from "@/calendar/hooks/use-delete-event";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogClose, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import type { IEvent } from "@/calendar/interfaces";

interface IProps {
  children?: React.ReactNode;
  event: IEvent;
  onDeleted?: () => void;
}

export function DeleteEventDialog({ children, event, onDeleted }: IProps) {
  const { isOpen, onClose, onToggle } = useDisclosure();
  const { removeEvent, isDeleting, error } = useDeleteEvent();
  const [confirmText, setConfirmText] = useState("");

  const handleDelete = async () => {
    if (confirmText !== event.title) {
      return;
    }
    
    const success = await removeEvent(event.id);
    if (success) {
      onClose();
      if (onDeleted) {
        onDeleted();
      }
    }
  };

  const isConfirmDisabled = confirmText !== event.title;

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="destructive" size="sm">
            <Trash2 className="size-4 mr-1" />
            Delete
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Event</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the event from the calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <p className="mb-4">
            <strong>Event:</strong> {event.title}
          </p>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">To confirm, type the event title below:</p>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={event.title}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>

          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isConfirmDisabled || isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}