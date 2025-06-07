"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/api';
import { AttendanceLog, AttendancePagination, LabMemberData } from '../types/LabTypes';

interface ClockLogTabProps {
  labId: number;
  labMembers: LabMemberData[];
  isActive: boolean;
}

export default function ClockLogTab({ labId, labMembers, isActive }: ClockLogTabProps) {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [attendancePagination, setAttendancePagination] = useState<AttendancePagination>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0
  });
  const [attendanceFilters, setAttendanceFilters] = useState({
    startDate: '',
    endDate: '',
    memberId: 'all'
  });

  const fetchAttendanceLogs = useCallback(async (page: number = 1) => {
    if (!labId) return;
    setIsLoadingAttendance(true);
    setAttendanceError(null);
    
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: attendancePagination.limit.toString(),
      });
      
      if (attendanceFilters.startDate) {
        queryParams.append('startDate', attendanceFilters.startDate);
      }
      if (attendanceFilters.endDate) {
        queryParams.append('endDate', attendanceFilters.endDate);
      }
      if (attendanceFilters.memberId && attendanceFilters.memberId !== 'all') {
        queryParams.append('memberId', attendanceFilters.memberId);
      }
      
      const response = await api.get(`/attendance/logs/${labId}?${queryParams.toString()}`);
      setAttendanceLogs(response.data.logs);
      setAttendancePagination(response.data.pagination);
    } catch (err: any) {
      console.error("Failed to fetch attendance logs:", err);
      setAttendanceError(err.response?.data?.message || "Failed to load attendance logs");
    } finally {
      setIsLoadingAttendance(false);
    }
  }, [labId, attendancePagination.limit, attendanceFilters]);

  useEffect(() => {
    if (isActive && labId) {
      fetchAttendanceLogs(1);
    }
  }, [isActive, labId, fetchAttendanceLogs]);

  const handleApplyFilters = () => {
    fetchAttendanceLogs(1);
  };

  const handleClearFilters = () => {
    setAttendanceFilters({
      startDate: '',
      endDate: '',
      memberId: 'all'
    });
    fetchAttendanceLogs(1);
  };

  const handleAttendancePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= attendancePagination.totalPages) {
      fetchAttendanceLogs(newPage);
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (minutes === null) return 'Ongoing';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Clock-in Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <h3 className="font-semibold text-sm">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-sm">Start Date</Label>
              <Input 
                id="startDate"
                type="date" 
                value={attendanceFilters.startDate}
                onChange={(e) => setAttendanceFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-sm">End Date</Label>
              <Input 
                id="endDate"
                type="date" 
                value={attendanceFilters.endDate}
                onChange={(e) => setAttendanceFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="memberSelect" className="text-sm">Member</Label>
              <Select 
                value={attendanceFilters.memberId}
                onValueChange={(value) => setAttendanceFilters(prev => ({ ...prev, memberId: value }))}
              >
                <SelectTrigger id="memberSelect">
                  <SelectValue placeholder="All members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All members</SelectItem>
                  {labMembers.map(member => (
                    <SelectItem key={member.memberID} value={member.memberID.toString()}>
                      {member.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleApplyFilters} size="sm" className="flex-1">
                Apply
              </Button>
              <Button onClick={handleClearFilters} variant="outline" size="sm" className="flex-1">
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Attendance Logs Table */}
        {isLoadingAttendance && (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading attendance logs...</p>
          </div>
        )}
        
        {attendanceError && (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-destructive">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p className="text-center">{attendanceError}</p>
            <Button variant="outline" className="mt-4" onClick={() => fetchAttendanceLogs(1)}>Retry</Button>
          </div>
        )}

        {!isLoadingAttendance && !attendanceError && attendanceLogs.length === 0 && (
          <p className="text-center text-gray-500 py-8">No attendance logs found.</p>
        )}

        {!isLoadingAttendance && !attendanceError && attendanceLogs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Member</th>
                  <th className="text-left p-2 font-medium">Role</th>
                  <th className="text-left p-2 font-medium">Clock In</th>
                  <th className="text-left p-2 font-medium">Clock Out</th>
                  <th className="text-left p-2 font-medium">Duration</th>
                  <th className="text-left p-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{log.memberName}</td>
                    <td className="p-2">{log.memberRole}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        {format(new Date(log.clockIn), 'MMM d, yyyy')}
                        <Clock className="h-3 w-3 text-gray-500 ml-2" />
                        {format(new Date(log.clockIn), 'HH:mm')}
                      </div>
                    </td>
                    <td className="p-2">
                      {log.clockOut ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          {format(new Date(log.clockOut), 'MMM d, yyyy')}
                          <Clock className="h-3 w-3 text-gray-500 ml-2" />
                          {format(new Date(log.clockOut), 'HH:mm')}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-2">{formatDuration(log.duration)}</td>
                    <td className="p-2">
                      {log.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      
      {/* Pagination */}
      {!isLoadingAttendance && !attendanceError && attendancePagination.totalPages > 1 && (
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Page {attendancePagination.page} of {attendancePagination.totalPages} 
            <span className="ml-2">({attendancePagination.totalCount} total records)</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAttendancePageChange(attendancePagination.page - 1)}
              disabled={attendancePagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAttendancePageChange(attendancePagination.page + 1)}
              disabled={attendancePagination.page === attendancePagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}