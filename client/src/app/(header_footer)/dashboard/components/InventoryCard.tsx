import React from 'react';
import type { InventoryItem } from './types';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface InventoryCardProps {
  item: InventoryItem;
}

export default function InventoryCard({ item }: InventoryCardProps) {
  return (
    <div className="flex flex-col gap-2 bg-card text-card-foreground rounded-md border border-border shadow p-3">
      <span className="font-medium text-base">{item.name}</span>
      <span className="text-destructive font-semibold text-base">
        {item.remaining} remaining out of {item.minStock} minimum
      </span>
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {item.tags.map((tag, idx) => (
            <TooltipProvider key={idx}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="font-sans bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
                  >
                    {tag.name}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tag.description || `${tag.name} category`}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}
    </div>
  );
} 