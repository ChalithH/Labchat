
"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventLinkProps {
  eventId: number;
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg";
}

export function EventLink({ 
  eventId, 
  children, 
  className, 
  variant = "outline", 
  size = "sm" 
}: EventLinkProps) {
  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={className}
    >
      <Link href={`/calendar/event/${eventId}`}>
        {children || (
          <>
            <ExternalLink className="h-4 w-4 mr-1" />
            View Event
          </>
        )}
      </Link>
    </Button>
  );
}