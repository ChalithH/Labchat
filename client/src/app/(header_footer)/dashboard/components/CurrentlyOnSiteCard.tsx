"use client";
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Member } from './types';

interface CurrentlyOnSiteCardProps {
  members: Member[];
}

// Helper function to get badge styling based on status
const getStatusBadgeProps = (status: string): { variant: "default" | "secondary" | "destructive" | "outline"; className?: string } => {
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case "active":
      return { variant: "default", className: "bg-green-500 text-white hover:bg-green-600" };
    case "work from home":
      return { variant: "default", className: "bg-blue-500 text-white hover:bg-blue-600" };
    case "pending induction":
      return { variant: "default", className: "bg-yellow-500 text-white hover:bg-yellow-600" };
    case "outside":
      return { variant: "default", className: "bg-purple-500 text-white hover:bg-purple-600" };
    case "inactive":
      return { variant: "secondary", className: "bg-gray-500 text-white hover:bg-gray-600" };
    default:
      return { variant: "secondary" };
  }
};

export default function CurrentlyOnSiteCard({ members }: CurrentlyOnSiteCardProps) {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_DISPLAY_COUNT = 5;

  // Sort members: PIC first (isPCI = true), then by permission level
  const sortedMembers = [...members].sort((a, b) => {
    // First sort by PIC status
    const aIsPIC = a.isPCI || false;
    const bIsPIC = b.isPCI || false;
    
    if (aIsPIC && !bIsPIC) return -1;
    if (!aIsPIC && bIsPIC) return 1;
    
    // Then sort by permission level
    return b.permissionLevel - a.permissionLevel;
  });

  const displayedMembers = showAll ? sortedMembers : sortedMembers.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMoreMembers = sortedMembers.length > INITIAL_DISPLAY_COUNT;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getMemberStatus = (member: Member): string => {
    // Check for active status in the status array first
    if (member.status && Array.isArray(member.status)) {
      const activeStatus = member.status.find(s => s.isActive);
      if (activeStatus?.status?.statusName) {
        return activeStatus.status.statusName;
      }
    }
    // Fall back to statusName field
    return member.statusName || 'No Status';
  };

  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        {members.length === 0 ? (
          <div className="text-muted-foreground text-center py-8 text-sm">
            No members currently in lab.
          </div>
        ) : (
          <div className="space-y-3">
            {displayedMembers.map((member, idx) => {
              const isPIC = member.isPCI || false;
              const memberStatus = getMemberStatus(member);
              
              return (
                <div 
                  key={idx} 
                  className="flex items-start justify-between gap-3"
                >
                  {/* Left side - Member info */}
                  <div className="flex justify-start gap-2 items-center">
                    <Avatar className="w-10 h-10 border-2 border-blue-500">
                      <AvatarImage src={member.image || undefined} alt={member.name} />
                      <AvatarFallback className="bg-zinc-950 text-zinc-50">
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1">
                        <Badge>{member.role}</Badge>
                        {isPIC && (
                          <Badge className="bg-blue-600 text-white hover:bg-blue-700">
                            PIC
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium tracking-tighter text-foreground">
                        {member.name}
                      </p>
                      {isPIC && member.clockIn ? (
                        <p className="text-xs text-muted-foreground leading-tight">
                          Signed in at {formatTime(member.clockIn)}
                        </p>
                      ) : (
                        <p className="text-xs leading-tight h-4">
                          {/* Placeholder for consistent spacing */}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Right side - Status */}
                  <div className="flex-shrink-0">
                    <Badge 
                      {...getStatusBadgeProps(memberStatus)}
                      className={`text-xs ${getStatusBadgeProps(memberStatus).className || ''}`}
                    >
                      {memberStatus}
                    </Badge>
                  </div>
                </div>
              );
            })}
            
            {hasMoreMembers && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="w-full mt-2 text-blue-600 hover:text-blue-700 h-8"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="mr-1.5 h-3.5 w-3.5" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1.5 h-3.5 w-3.5" />
                    Show {sortedMembers.length - INITIAL_DISPLAY_COUNT} more
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}