"use client";
import React, { useState } from "react";
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
import type { Announcement, Member, Job, InventoryItem } from "./types";

interface DashboardClientProps {
  user: {
    username?: string;
    firstName?: string;
    jobTitle?: string;
    image?: string;
    // ...other fields if needed
  };
  announcements: Announcement[];
  members: Member[];
  jobs: Job[];
  inventory: InventoryItem[];
}

export default function DashboardClient({ user, announcements, members: initialMembers, jobs, inventory }: DashboardClientProps) {
    // console.log('debugging');
    // console.log(user);
    // console.log('debugging');
    console.log("DashboardClient jobs prop:", jobs);
  // Announcements carousel state
  const [activeAnnouncement, setActiveAnnouncement] = useState<number>(0);
  // Clock in/out state and members list
  const [clockedIn, setClockedIn] = useState<boolean>(false);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  
  // Expanded state for sections
  const [membersExpanded, setMembersExpanded] = useState<boolean>(false);
  const [jobsExpanded, setJobsExpanded] = useState<boolean>(false);
  const [inventoryExpanded, setInventoryExpanded] = useState<boolean>(false);

  // Constants for item limits
  const MEMBERS_LIMIT = 5;
  const JOBS_LIMIT = 3;
  const INVENTORY_LIMIT = 3;

  const handleClockInOut = () => {
    if (!clockedIn) {
      // Clock in - add current user to members list
      const currentUserMember: Member = {
        name: user?.firstName || "User",
        title: user?.jobTitle || "Lab Member",
        image: user?.image || '/default_pfp.svg'
      };
      setMembers(prev => [...prev, currentUserMember]);
    } else {
      // Clock out - remove current user from members list
      setMembers(prev => prev.filter(member => member.name !== (user?.firstName || "User")));
    }
    setClockedIn(!clockedIn);
  };

  const handlePrevAnnouncement = () => {
    setActiveAnnouncement((prev: number) => (prev - 1 + announcements.length) % announcements.length);
  };
  const handleNextAnnouncement = () => {
    setActiveAnnouncement((prev: number) => (prev + 1) % announcements.length);
  };

  // Get displayed items based on expanded state
  const displayedMembers = membersExpanded ? members : members.slice(0, MEMBERS_LIMIT);
  const displayedJobs = jobsExpanded ? jobs : jobs.slice(0, JOBS_LIMIT);
  const displayedInventory = inventoryExpanded ? inventory : inventory.slice(0, INVENTORY_LIMIT);

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
        <p className="text-muted-foreground text-sm">Here's a quick overview of what's happening.</p>
      </section>

      {/* Row 1: Announcements + Currently in Lab */}
      <section className="grid gap-8 md:grid-cols-2 items-start">
        {/* Announcements */}
        <div>
          <div className="flex items-center mb-2 md:pr-8">
            <h2 className="text-lg font-semibold flex-grow">Recent Announcements</h2>
            <Button asChild className="rounded-full bg-blue-400 hover:bg-blue-500 text-white px-6 py-1 text-sm">
              <a href="/discussion/topic/1">View All</a>
            </Button>
          </div>
          <div className="relative">
            <div className="flex justify-center items-center">
              <div className="w-full max-w-xl relative">
                <button
                  onClick={handlePrevAnnouncement}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-black text-3xl"
                  aria-label="Previous announcement"
                >◀</button>
                <AnnouncementCard announcement={announcements[activeAnnouncement]} />
                <button
                  onClick={handleNextAnnouncement}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-black text-3xl"
                  aria-label="Next announcement"
                >▶</button>
              </div>
            </div>
          </div>
        </div>

        {/* Currently in Lab */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Currently in Lab: {members.length}</h2>
            <div className="flex gap-2">
              <Button
                className={clockedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                onClick={handleClockInOut}
              >
                {clockedIn ? 'Clock Out' : 'Clock In'}
              </Button>
              <Button asChild className="rounded-full bg-blue-400 hover:bg-blue-500 text-white px-6 py-1 text-sm">
                <a href="/members">View All</a>
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {displayedMembers
              .sort((a: Member, b: Member) => (a.title === 'Lab Manager' && b.title !== 'Lab Manager' ? -1 : 1))
              .map((member: Member, idx: number) => (
                <MemberCard key={idx} member={member} />
              ))}
            {!membersExpanded && members.length > MEMBERS_LIMIT && (
              <Button 
                variant="ghost" 
                className="w-full text-blue-500 hover:text-blue-600 mt-2"
                onClick={() => setMembersExpanded(true)}
              >
                View {members.length - MEMBERS_LIMIT} more members
              </Button>
            )}
            {membersExpanded && (
              <Button 
                variant="ghost" 
                className="w-full text-blue-500 hover:text-blue-600 mt-2"
                onClick={() => setMembersExpanded(false)}
              >
                Show less
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Jobs */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Your Calendar</h2>
          <Button asChild className="rounded-full bg-blue-400 hover:bg-blue-500 text-white px-6 py-1 text-sm">
            <a href="/calendar">View All</a>
          </Button>
        </div>
        <div className="space-y-2">
          {jobs.length === 0 ? (
            <div className="text-gray-500">No upcoming jobs.</div>
          ) : (
            <>
              {displayedJobs.map((job: Job, idx: number) => (
                <JobCard key={idx} job={job} />
              ))}
              {!jobsExpanded && jobs.length > JOBS_LIMIT && (
                <Button 
                  variant="ghost" 
                  className="w-full text-blue-500 hover:text-blue-600 mt-2"
                  onClick={() => setJobsExpanded(true)}
                >
                  View {jobs.length - JOBS_LIMIT} more events
                </Button>
              )}
              {jobsExpanded && (
                <Button 
                  variant="ghost" 
                  className="w-full text-blue-500 hover:text-blue-600 mt-2"
                  onClick={() => setJobsExpanded(false)}
                >
                  Show less
                </Button>
              )}
            </>
          )}
        </div>
      </section>

      {/* Inventory Warnings */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Inventory Warnings</h2>
        </div>
        <div className="space-y-2">
          {inventory.length === 0 ? (
            <div className="text-gray-500">No inventory warnings.</div>
          ) : (
            <>
              {displayedInventory.map((item: InventoryItem, idx: number) => (
                <InventoryCard key={idx} item={item} />
              ))}
              {!inventoryExpanded && inventory.length > INVENTORY_LIMIT && (
                <Button 
                  variant="ghost" 
                  className="w-full text-blue-500 hover:text-blue-600 mt-2"
                  onClick={() => setInventoryExpanded(true)}
                >
                  View {inventory.length - INVENTORY_LIMIT} more warnings
                </Button>
              )}
              {inventoryExpanded && (
                <Button 
                  variant="ghost" 
                  className="w-full text-blue-500 hover:text-blue-600 mt-2"
                  onClick={() => setInventoryExpanded(false)}
                >
                  Show less
                </Button>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
} 