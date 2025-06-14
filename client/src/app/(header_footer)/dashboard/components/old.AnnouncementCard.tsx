import React from 'react';
import RecentActivity from "@/app/(header_footer)/(discussion)/components/RecentActivity";
import { PostType } from '@/types/post.type';
import './carousel-override.css'; // This will be created next

// BACKUP: Old carousel-based announcement component
export default function AnnouncementCardCarousel({ announcement }: { announcement: PostType[] }) {
  return (
    <div className="dashboard-carousel-wrapper relative overflow-visible">
      <RecentActivity posts={announcement} />
    </div>
  );
} 