"use client";

import { useState } from "react";
import { CheckCircle, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { StatusConfirmationDialog } from "@/calendar/components/dialogs/status-confirmation-dialog";
import axios from "axios";
import type { IEvent } from "@/calendar/interfaces";

interface StatusAction {
  action: string;
  label: string;
  newStatus: string;
  icon: React.ReactNode;
  variant: "default" | "destructive";
  description: string;
}

interface StatusActionProps {
  event: IEvent;
  onStatusChange?: (updatedEvent: IEvent) => void;
  className?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export function StatusAction({ event, onStatusChange, className }: StatusActionProps) {
  const { setLocalEvents } = useCalendar();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAvailableActions = (): StatusAction[] => {
    const currentStatus = event.status?.name?.toLowerCase();
    const actions: StatusAction[] = [];
    
    if (currentStatus === 'scheduled') {
      actions.push({
        action: 'complete',
        label: 'Complete',
        newStatus: 'completed',
        icon: <CheckCircle className="h-4 w-4" />,
        variant: 'default',
        description: 'This will mark the event as completed and cannot be undone.'
      });
    }
    
    if (currentStatus === 'scheduled' || currentStatus === 'booked') {
      actions.push({
        action: 'cancel',
        label: 'Cancel',
        newStatus: 'cancelled',
        icon: <X className="h-4 w-4" />,
        variant: 'destructive',
        description: 'This will cancel the event and cannot be undone.'
      });
    }
    
    return actions;
  };

  const availableActions = getAvailableActions();

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await axios.put(`${API_URL}/calendar/change-status`, {
        eventId: event.id,
        statusName: newStatus
      });

      if (response.status === 200) {
        // Create updated event
        const updatedEvent: IEvent = {
          ...event,
          status: {
            id: response.data.status.id,
            name: response.data.status.name,
            color: response.data.status.color,
            description: response.data.status.description
          }
        };

        // Update local events state
        setLocalEvents(prevEvents => 
          prevEvents.map(e => e.id === event.id ? updatedEvent : e)
        );

        // Call the callback if provided
        if (onStatusChange) {
          onStatusChange(updatedEvent);
        }
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Show current status
  const currentStatus = event.status;
  const statusColor = currentStatus?.color || '#6B7280';

  return (
    <div className={className}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          {currentStatus && (
            <Badge 
              className="text-white border-0 font-medium text-xs"
              style={{
                backgroundColor: statusColor,
                color: 'white'
              }}
            >
              {currentStatus.name}
            </Badge>
          )}
        </div>

        {availableActions.length > 0 && (
          <div className="flex items-center gap-2">
            {availableActions.map((action) => (
              <StatusConfirmationDialog
                key={action.action}
                event={event}
                action={action}
                onConfirm={() => handleStatusChange(action.newStatus)}
                isUpdating={isUpdating}
              >
                <Button
                  variant={action.variant}
                  size="sm"
                  disabled={isUpdating}
                  className="flex items-center gap-2"
                >
                  {action.icon}
                  {action.label}
                </Button>
              </StatusConfirmationDialog>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}