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
import { DashboardStatusModal } from "./DashboardStatusModal";

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
    memberID?: number;
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
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalLoading, setStatusModalLoading] = useState(false);
  const [statusModalError, setStatusModalError] = useState<string | null>(null);
  const [fullCurrentUserMember, setFullCurrentUserMember] = useState<Member | null>(null);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [showAllInventory, setShowAllInventory] = useState(false);

  // Fetch attendance status and current members on mount
  useEffect(() => {
    getAttendanceStatus(1).then(data => {
      setIsClockedIn(data.isClockedIn);
    });
    getCurrentMembers(1).then(data => {
      setCurrentMembers(data.members || []);
    });
  }, []);

  useEffect(() => {
    if (user.memberID) {
      api.get(`/member/get-with-status/${user.memberID}`)
        .then(res => {
          setFullCurrentUserMember(res.data);
        })
        .catch(err => {
          console.error('Failed to fetch member with status', err);
        });
    }
  }, [user.memberID]);

  // Refresh both status and members after clock in/out
  const refreshAttendance = async () => {
    const status = await getAttendanceStatus(1);
    setIsClockedIn(status.isClockedIn);
    const members = await getCurrentMembers(1);
    setCurrentMembers(members.members || []);
  };

  const handleClockIn = async () => {
    setStatusModalOpen(true);
  };

  const handleClockOut = async () => {
    setLoading(true);
    await clockOut(1);
    await refreshAttendance();
    setLoading(false);
  };

  const handleStatusModalConfirm = async (statusId: number | undefined) => {
    setStatusModalLoading(true);
    setStatusModalError(null);
    try {
      if (statusId && fullCurrentUserMember) {
        await api.post("/member/set-status", {
          memberId: fullCurrentUserMember.memberID,
          statusId,
        });
      }
      await clockIn(1);
      setStatusModalOpen(false);
      await refreshAttendance();
      // Refetch full member info after status change
      if (user.memberID) {
        api.get(`/member/get-with-status/${user.memberID}`).then(res => {
          setFullCurrentUserMember(res.data);
        });
      }
    } catch (err: any) {
      setStatusModalError(err.message || "Failed to update status or clock in");
    } finally {
      setStatusModalLoading(false);
    }
  };

  return (
    <main className="barlow-font px-6 py-8 space-y-10 max-w-6xl mx-auto bg-background text-foreground">
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
        <div className="md:ml-4 p-4">
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
              <div className="text-muted-foreground">No members currently in lab.</div>
            ) : (
              currentMembers
                .slice()
                .sort((a, b) => b.permissionLevel - a.permissionLevel)
                .map((member, idx) => (
                  <MemberCard key={idx} member={member} />
                ))
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Jobs */}
      <section className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Your Calendar</h2>
          <Button asChild className="rounded-full bg-blue-400 hover:bg-blue-500 text-white px-6 py-1 text-sm">
            <Link href="/calendar">View All</Link>
          </Button>
        </div>
        <div className="space-y-2">
          {(showAllJobs ? jobs : jobs.slice(0, 3)).map((job: Job, idx: number) => (
            <JobCard key={idx} job={job} />
          ))}
          {jobs.length > 3 && (
            <button
              className="text-blue-500 hover:underline text-sm mt-2"
              onClick={() => setShowAllJobs((prev) => !prev)}
            >
              {showAllJobs ? "Show less" : `Show ${jobs.length - 3} more`}
            </button>
          )}
          {jobs.length === 0 && (
            <div className="text-muted-foreground">No upcoming jobs.</div>
          )}
        </div>
      </section>

      {/* Inventory Warnings */}
      <section className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Inventory Warnings</h2>
          <Button asChild className="rounded-full bg-blue-400 hover:bg-blue-500 text-white px-6 py-1 text-sm">
            <Link href="/inventory">View All</Link>
          </Button>
        </div>
        <div className="space-y-2">
          {inventory.length === 0 ? (
            <div className="text-muted-foreground">No inventory warnings.</div>
          ) : (
            <>
              {(showAllInventory ? inventory : inventory.slice(0, 3)).map((item: InventoryItem, idx: number) => (
                <InventoryCard key={idx} item={item} />
              ))}
              {inventory.length > 3 && (
                <button
                  className="text-blue-500 hover:underline text-sm mt-2"
                  onClick={() => setShowAllInventory((prev) => !prev)}
                >
                  {showAllInventory ? "Show less" : `Show ${inventory.length - 3} more`}
                </button>
              )}
            </>
          )}
        </div>
      </section>

      {/* Status Modal for current user */}
      {fullCurrentUserMember && (
        <DashboardStatusModal
          open={statusModalOpen}
          onOpenChange={setStatusModalOpen}
          member={fullCurrentUserMember}
          onConfirm={handleStatusModalConfirm}
          loading={statusModalLoading}
          error={statusModalError}
        />
      )}
    </main>
  );
} 