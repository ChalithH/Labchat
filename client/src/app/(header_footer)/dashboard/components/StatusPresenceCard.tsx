"use client";
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

interface StatusOption {
  status: {
    id: number;
    statusName: string;
    statusWeight: number;
  };
  isActive: boolean;
  contactType?: string;
  contactInfo?: string;
  contactName?: string;
  description?: string;
}

interface Member {
  memberID: number;
  displayName?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  status: StatusOption[];
  labAttendance?: any[];
  labId?: number;
}

interface StatusPresenceCardProps {
  member: Member;
  isCheckedIn: boolean;
  checkInTime?: string | Date | null;
  onStatusChange?: () => Promise<void>;
  onAttendanceChange?: () => Promise<void>;
}

export default function StatusPresenceCard({ 
  member, 
  isCheckedIn,
  checkInTime,
  onStatusChange,
  onAttendanceChange 
}: StatusPresenceCardProps) {
  const [loading, setLoading] = useState(false);

  // Get current active status
  const activeStatus = member.status?.find(s => s.isActive);
  const currentStatus = activeStatus?.status?.statusName || 'No Status';

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      if (member.labId) {
        await api.post('/attendance/clock-in', { labId: member.labId });
        if (onAttendanceChange) await onAttendanceChange();
      }
    } catch (err) {
      console.error("Failed to check in:", err);
    }
    setLoading(false);
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      // Find the inactive status ID
      const inactiveStatus = member.status?.find(s => 
        s.status.statusName.toLowerCase() === 'inactive'
      );
      
      if (inactiveStatus) {
        await api.post("/member/set-status", {
          memberId: member.memberID,
          statusId: inactiveStatus.status.id
        });
      }
      
      if (member.labId) {
        await api.post('/attendance/clock-out', { labId: member.labId });
        if (onAttendanceChange) await onAttendanceChange();
        if (onStatusChange) await onStatusChange();
      }
    } catch (err) {
      console.error("Failed to check out:", err);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500 text-white";
      case "work from home":
        return "bg-blue-500 text-white";
      case "pending induction":
        return "bg-yellow-500 text-white";
      case "outside":
        return "bg-purple-500 text-white";
      case "inactive":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card className="h-full">
      <CardContent className="pt-6 space-y-6">
        {/* Status Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-medium">Status</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Trigger status modal in parent component
                const event = new CustomEvent('openStatusModal');
                window.dispatchEvent(event);
              }}
              className="text-xs"
            >
              Update Status
            </Button>
          </div>
          
          <div className="space-y-2">
            <Badge className={`${getStatusColor(currentStatus)} text-sm px-3 py-1`}>
              {currentStatus}
            </Badge>
            
            {activeStatus && (
              <>
                {activeStatus.description && (
                  <p className="text-sm text-muted-foreground">
                    {activeStatus.description}
                  </p>
                )}
                {activeStatus.contactInfo && (
                  <p className="text-sm text-muted-foreground">
                    Contact: {activeStatus.contactInfo}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Lab Presence Section */}
        <div className="border-t pt-6">
          <h3 className="text-base font-medium mb-3">Lab Presence</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isCheckedIn ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm">
                {isCheckedIn && checkInTime ? `On-site (${formatTime(checkInTime.toString())})` : 'Off-site'}
              </span>
            </div>
            
            <Button
              size="sm"
              onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
              disabled={loading}
              className={isCheckedIn ? 'bg-gray-600 hover:bg-gray-700' : ''}
            >
              {isCheckedIn ? 'Check Out' : 'Check In'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}