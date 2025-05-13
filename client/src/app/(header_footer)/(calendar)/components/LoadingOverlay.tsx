import React from 'react';
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isLoading: boolean;
  className?: string;
}

export function LoadingOverlay({ isLoading, className }: LoadingOverlayProps) {
  if (!isLoading) return null;
  
  return (
    <div className={cn(
      "absolute inset-0 z-50 flex items-center justify-center bg-background/70",
      className
    )}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading events...</p>
      </div>
    </div>
  );
}