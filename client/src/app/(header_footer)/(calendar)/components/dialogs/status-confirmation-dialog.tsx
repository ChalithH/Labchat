"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";

import { useDisclosure } from "@/hooks/use-disclosure";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogClose, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import type { IEvent } from "@/calendar/interfaces";

interface StatusAction {
  action: string;
  label: string;
  newStatus: string;
  icon: React.ReactNode;
  variant: "default" | "destructive";
  description: string;
}

interface StatusConfirmationDialogProps {
  children: React.ReactNode;
  event: IEvent;
  action: StatusAction;
  onConfirm: () => Promise<void>;
  isUpdating?: boolean;
}

export function StatusConfirmationDialog({ 
  children, 
  event, 
  action, 
  onConfirm, 
  isUpdating = false 
}: StatusConfirmationDialogProps) {
  const { isOpen, onClose, onToggle } = useDisclosure();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsProcessing(false);
    }
  };

  const currentStatus = event.status;
  const isDestructive = action.variant === "destructive";

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {isDestructive ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : (
              <CheckCircle className="h-5 w-5 text-primary" />
            )}
            <DialogTitle>Confirm Status Change</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to {action.label.toLowerCase()} this event? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Event Info */}
          <div className="rounded-lg border p-3 bg-muted/50">
            <h4 className="font-medium text-sm mb-2">Event Details</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Title:</span>
                <span className="ml-2 font-medium">{event.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Current Status:</span>
                {currentStatus && (
                  <Badge 
                    className="text-white border-0 font-medium text-xs"
                    style={{
                      backgroundColor: currentStatus.color || '#6B7280',
                      color: 'white'
                    }}
                  >
                    {currentStatus.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Status Change Info */}
          <div className={`rounded-lg border p-3 ${isDestructive ? 'bg-destructive/5 border-destructive/20' : 'bg-primary/5 border-primary/20'}`}>
            <div className="flex items-center gap-2 mb-2">
              {action.icon}
              <h4 className="font-medium text-sm">{action.label}</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {action.description}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">New Status:</span>
              <Badge 
                className={`text-white border-0 font-medium text-xs ${
                  isDestructive ? 'bg-destructive' : 'bg-primary'
                }`}
              >
                {action.newStatus}
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isProcessing}>
              Cancel
            </Button>
          </DialogClose>

          <Button 
            variant={action.variant}
            onClick={handleConfirm} 
            disabled={isProcessing || isUpdating}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              action.icon
            )}
            {isProcessing ? 'Processing...' : action.label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}