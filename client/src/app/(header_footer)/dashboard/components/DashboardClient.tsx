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
import { getEvents } from "@/app/(header_footer)/(calendar)/requests";
import { useCurrentLabId } from "@/contexts/lab-context";
import ResolveRoleName from '@/lib/resolve_role_name.util';
import { parseISO, startOfDay, startOfToday, format, isAfter, isSameDay } from 'date-fns';

// Attendance API helpers
async function clockIn(labId: number) {
  const res = await api.post('/attendance/clock-in', { labId });
  return res.data;
}
async function clockOut(labId: number) {
  const res = await api.post('/attendance/clock-out', { labId });
  return res.data;
}
async function getAttendanceStatus(labId: number) {
  const res = await api.get(`/attendance/status?labId=${labId}`);
  return res.data;
}
async function getCurrentMembers(labId: number) {
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
    lastViewedLabId: number;
    userId: number;
  };
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const currentLabId = useCurrentLabId(); // Get current lab ID from context
  const [isClockedIn, setIsClockedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentMembers, setCurrentMembers] = useState<Member[]>([]);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalLoading, setStatusModalLoading] = useState(false);
  const [statusModalError, setStatusModalError] = useState<string | null>(null);
  const [fullCurrentUserMember, setFullCurrentUserMember] = useState<Member | null>(null);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [showAllInventory, setShowAllInventory] = useState(false);

  // State for data previously passed as props
  const [announcements, setAnnouncements] = useState<PostType[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [currentMemberId, setCurrentMemberId] = useState<number | null>(user.memberID || null);

  useEffect(() => {
    const sessionUserId = user.userId;

    if (!currentLabId || !sessionUserId) return;

    // Fetch memberId for the current user and lab
    api.get(`/member/memberships/user/${sessionUserId}`)
      .then(memberRes => {
        const currentLabMembership = memberRes.data.find((mem: any) => mem.labId === currentLabId);
        if (currentLabMembership) {
          setCurrentMemberId(currentLabMembership.id);
        } else {
          setCurrentMemberId(null);
          console.warn(`User is not a member of lab ${currentLabId}`);
        }
      })
      .catch(err => {
        console.error('Error fetching member data:', err);
        setCurrentMemberId(null);
      });

    // Fetch announcements
    api.get(`/discussion/announcements/lab/${currentLabId}`)
      .then(async announcementRes => {
        const posts = announcementRes.data;
        const announcementsInfo = await Promise.all(posts.map(async (post: any) => {
          let authorName = 'Unknown';
          let authorRole = 'User';
          let authorImage = '/default_pfp.svg';
          try {
            const memberRes = await api.get(`/member/get/${post.memberId}`);
            const memberData = memberRes.data;
            const userRes = await api.get(`/user/get/${memberData.userId}`);
            const userData = userRes.data;
            authorName = userData.displayName || userData.username || 'Unknown';
            authorRole = memberData.labRole ? memberData.labRole.name : 'Lab Member';
            authorImage = userData.image || '/default_pfp.svg';
          } catch (error) {
            console.error('Error fetching announcement author details:', error);
          }
          return {
            id: post.id,
            discussionId: post.discussionId,
            memberId: post.memberId,
            title: post.title,
            content: post.content,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            isPinned: post.isPinned,
            isAnnounce: post.isAnnounce,
            authorName,
            authorRole,
            authorImage,
          };
        }));
        setAnnouncements(announcementsInfo);
      })
      .catch(err => {
        console.error(`[Lab ${currentLabId}] Failed to get announcements:`, err);
        setAnnouncements([]);
      });

    // Fetch inventory
    api.get(`/inventory/${currentLabId}`)
      .then(inventoryRes => {
        const lowStockInventory = inventoryRes.data
          .filter((item: any) => item.currentStock <= item.minStock)
          .map((item: any) => ({
            name: item.item.name,
            remaining: item.currentStock,
            minStock: item.minStock,
            tags: item.itemTags
              ? item.itemTags.map((apiTag: any) => ({
                  name: apiTag.name,
                  description: apiTag.description
                }))
              : [],
          }));
        setInventory(lowStockInventory);
      })
      .catch(err => {
        console.error("Failed to get inventory:", err);
        setInventory([]);
      });
    
    // Fetch attendance status and current members
    getAttendanceStatus(currentLabId).then(data => {
      setIsClockedIn(data.isClockedIn);
    }).catch(err => console.error("Failed to get attendance status:", err));
    getCurrentMembers(currentLabId).then(data => {
      setCurrentMembers(data.members || []);
    }).catch(err => console.error("Failed to get current members:", err));

  }, [currentLabId, user.userId]);

 useEffect(() => {
    // Fetch jobs (calendar events) using the current lab context
    if (!currentLabId || currentMemberId === null) {
      setJobs([]); // Clear jobs if no lab or member ID
      return;
    }

    // Start from beginning of today instead of current time
    const startDate = startOfToday();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    getEvents(startDate, endDate, currentLabId) // Pass currentLabId to getEvents
      .then(allEvents => {
        const userEvents = allEvents
          .filter((event: any) => {
            const isAssigned = event.assignments?.some(
              (assignment: any) => String(assignment.memberId) === String(currentMemberId)
            );
            
            const eventStart = parseISO(event.startDate);
            const today = new Date();
            
            // Compare only the date parts (ignore time) to avoid timezone issues
            const eventDate = format(eventStart, 'yyyy-MM-dd');
            const todayDate = format(today, 'yyyy-MM-dd');
            const isToday = eventDate === todayDate;
            const isFuture = eventDate > todayDate;
            
            return isAssigned && (isToday || isFuture);
          })
          .sort((a: any, b: any) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());
        
        const formattedJobs = userEvents.map((event: any) => ({
          name: event.title,
          time: event.startDate,
        }));
        
        setJobs(formattedJobs);
      })
      .catch(err => {
        console.error("Failed to get events/jobs:", err);
        setJobs([]);
      });
  }, [currentLabId, currentMemberId]);

  useEffect(() => {
    if (currentMemberId) {
      api.get(`/member/get-with-status/${currentMemberId}`)
        .then(res => {
          setFullCurrentUserMember(res.data);
        })
        .catch(err => {
          console.error('Failed to fetch member with status', err);
          setFullCurrentUserMember(null);
        });
    } else {
      setFullCurrentUserMember(null);
    }
  }, [currentMemberId]);

  // Refresh attendance and current members after clock in/out or status change
  const refreshAttendanceAndMembers = async () => {
    if (currentLabId) {
      try {
        const status = await getAttendanceStatus(currentLabId);
    setIsClockedIn(status.isClockedIn);
        const membersData = await getCurrentMembers(currentLabId);
        setCurrentMembers(membersData.members || []);
      } catch (err) {
        console.error("Failed to refresh attendance and members:", err);
      }
    }
  };

  const handleClockIn = async () => {
    setStatusModalOpen(true);
  };

  const handleClockOut = async () => {
    setLoading(true);
    if (currentLabId) {
      try {
        setStatusModalOpen(true);
        await clockOut(currentLabId);
        await refreshAttendanceAndMembers();
      } catch (err) {
        console.error("Failed to clock out:", err);
      }
    }
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
      if (currentLabId) {
        await clockIn(currentLabId);
      setStatusModalOpen(false);
        await refreshAttendanceAndMembers();
      // Refetch full member info after status change
        if (currentMemberId) {
          api.get(`/member/get-with-status/${currentMemberId}`).then(res => {
          setFullCurrentUserMember(res.data);
        });
        }
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