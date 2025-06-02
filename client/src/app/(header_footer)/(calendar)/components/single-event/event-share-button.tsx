// client/src/app/(header_footer)/(calendar)/components/single-event/event-share-button.tsx

"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EventShareButtonProps {
  eventId: number;
  eventTitle: string;
}

export function EventShareButton({ eventId, eventTitle }: EventShareButtonProps) {
  const [copied, setCopied] = useState(false);
  
  const eventUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/calendar/event/${eventId}`
    : '';

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventTitle,
          text: `Check out this event: ${eventTitle}`,
          url: eventUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Share Event</h4>
            <p className="text-sm text-muted-foreground">
              Share this event with others
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="event-url">Event URL</Label>
            <div className="flex gap-2">
              <Input
                id="event-url"
                value={eventUrl}
                readOnly
                className="text-sm"
              />
              <Button
                size="sm"
                onClick={handleCopyUrl}
                variant="outline"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
            <Button
              onClick={handleNativeShare}
              className="w-full"
              variant="outline"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share via Device
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}