"use client";
import React, { useEffect, useState } from "react";
import AnnouncementCard from "./AnnouncementCard";
import MemberCard from "./MemberCard";
import JobCard from "./JobCard";
import InventoryCard from "./InventoryCard";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Member, Job, InventoryItem } from "./types";
import { PostType } from "@/types/post.type";
import Link from "next/link";
import api from '@/lib/api';

// Attendance API helpers using Axios instance
async function clockIn(labId = 1) {
  const res = await api.post('/attendance/clock-in', { labId });
  return res.data;
}
async function clockOut(labId = 1) {
  const res = await api.post('/attendance/clock-out', { labId });
  return res.data;
}
async function getAttendanceStatus(labId = 1) {
  const res = await api.get(`/attendance/status?labId=${labId}`);
  return res.data;
}
async function getCurrentMembers(labId = 1) {
  const res = await api.get(`/attendance/current-members?labId=${labId}`);
  return res.data;
}

interface DashboardClientProps {
  user: {
    firstName?: string;
    image?: string;
    role?: string;
    statusName?: string;
  };
  announcements: PostType[];
  members: Member[];
  jobs: Job[];
  inventory: InventoryItem[];
}

export default function DashboardClient({ user, announcements, jobs, inventory }: DashboardClientProps) {
  const [isClockedIn, setIsClockedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentMembers, setCurrentMembers] = useState<Member[]>([]);

  // Fetch attendance status and current members on mount
  useEffect(() => {
    getAttendanceStatus(1).then(data => {
      setIsClockedIn(data.isClockedIn);
    });
    getCurrentMembers(1).then(data => {
      setCurrentMembers(data.members || []);
    });
  }, []);

  // Refresh both status and members after clock in/out
  const refreshAttendance = async () => {
    const status = await getAttendanceStatus(1);
    setIsClockedIn(status.isClockedIn);
    const members = await getCurrentMembers(1);
    setCurrentMembers(members.members || []);
  };

  const handleClockIn = async () => {
    setLoading(true);
    await clockIn(1);
    await refreshAttendance();
    setLoading(false);
  };

  const handleClockOut = async () => {
    setLoading(true);
    await clockOut(1);
    await refreshAttendance();
    setLoading(false);
  };

  return (
    <main className="barlow-font px-6 py-8 space-y-10 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/home">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Greeting */}
      <section>
        <h1 className="text-2xl font-semibold">
          Welcome back, {user?.firstName || "User"}
        </h1>
        <p className="text-muted-foreground text-sm">Here&apos;s a quick overview of what&apos;s happening.</p>
      </section>

      {/* Row 1: Announcements + Currently in Lab */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
        {/* Announcements */}
        <div className="md:mr-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex-grow">Recent Announcements</h2>
            <Button asChild className="rounded-full bg-blue-400 hover:bg-blue-500 text-white px-6 py-1 text-sm">
              <Link href="/discussion/topic/1">View All</Link>
            </Button>
          </div>
          <div className="overflow-visible w-full" style={{ overflow: 'visible' }}>
            <AnnouncementCard announcement={announcements} />
          </div>
        </div>

        {/* Currently in Lab */}
        <div className="md:ml-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Currently in Lab ({currentMembers.length})</h2>
            <div className="flex gap-2">
              {isClockedIn !== null && (
                <Button
                  className={isClockedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                  onClick={isClockedIn ? handleClockOut : handleClockIn}
                  disabled={loading}
                >
                  {isClockedIn ? 'Clock Out' : 'Clock In'}
                </Button>
              )}
              <Button asChild className="rounded-full bg-blue-400 hover:bg-blue-500 text-white px-6 py-1 text-sm">
                <Link href="/members">View All</Link>
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {currentMembers.length === 0 ? (
              <div className="text-gray-500">No members currently in lab.</div>
            ) : (
              currentMembers.map((member, idx) => (
                <MemberCard key={idx} member={member} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Jobs */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Your Calendar</h2>
          <Button asChild className="rounded-full bg-blue-400 hover:bg-blue-500 text-white px-6 py-1 text-sm">
            <Link href="/calendar">View All</Link>
          </Button>
        </div>
        <div className="space-y-2">
          {jobs.length === 0 ? (
            <div className="text-gray-500">No upcoming jobs.</div>
          ) : (
            <>
              {jobs.map((job: Job, idx: number) => (
                <JobCard key={idx} job={job} />
              ))}
            </>
          )}
        </div>
      </section>

      {/* Inventory Warnings */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Inventory Warnings</h2>
          <Button asChild className="rounded-full bg-blue-400 hover:bg-blue-500 text-white px-6 py-1 text-sm">
            <Link href="/inventory">View All</Link>
          </Button>
        </div>
        <div className="space-y-2">
          {inventory.length === 0 ? (
            <div className="text-gray-500">No inventory warnings.</div>
          ) : (
            <>
              {inventory.map((item: InventoryItem, idx: number) => (
                <InventoryCard key={idx} item={item} />
              ))}
            </>
          )}
        </div>
      </section>
    </main>
  );
} 