import React from 'react';
import { redirect } from 'next/navigation';
import setUsersLastViewed from '@/lib/set_last_viewed';
import getUserFromSessionServer from '@/lib/get_user_server';
import DashboardClient from './components/DashboardClient';
import api from '@/lib/api';
import { startOfMonth, endOfMonth } from 'date-fns';
import { getEvents } from '@/app/(header_footer)/(calendar)/requests';

export default async function DashboardPage() {
  setUsersLastViewed('/dashboard');

  const user = await getUserFromSessionServer();
  if (!user) {
    redirect('/home');
  }

  // Fetch posts from the Announcements topic (topic 1)
  const topicAnnouncementsRequest = await api.get('/discussion/category-posts/1');
  const posts = topicAnnouncementsRequest.data.filter((post: any) => post.isAnnounce);

  // Fetch member and user info for each announcement
  const announcements = await Promise.all(posts.map(async (post: any) => {
    let authorName = 'Unknown';
    let authorRole = 'User';
    let authorImage = '/default_pfp.svg';
    try {
      const memberRes = await api.get(`/member/get/${post.memberId}`);
      const member = memberRes.data;
      const userRes = await api.get(`/user/get/${member.userId}`);
      const user = userRes.data;
      authorName = user.displayName || user.username || 'Unknown';
      authorRole = user.jobTitle || 'User';
      authorImage = user.image || '/default_pfp.svg';
    } catch (error) {
      console.error('Error fetching announcement author details:', error);
    }
    return {
      title: post.title,
      content: post.content,
      authorName,
      authorRole,
      authorImage,
    };
  }));

  // Fetch currently in lab members (active status)
  const membersRequest = await api.get('/lab/getMembers/1');
  const members = membersRequest.data
    .filter((m: any) => m.status.some((s: any) => s.isActive && s.status.statusName === 'Active'))
    .map((m: any) => ({
      name: m.displayName,
      title: m.jobTitle,
      image: m.image || '/default_pfp.svg',
    }));

  // Get the user's memberId
  let memberId = user.memberId;
  
  if (!memberId) {
    try {
      const memberRes = await api.get(`/member/get/user/${user.id}`);
      memberId = memberRes.data.id;
    } catch (error) {
      console.error('Error fetching member data:', error);
      memberId = null;
    }
  }

  // Fetch all events for the lab (from today onwards)
  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 10); // Set far future date to get all upcoming events
  const allEvents = await getEvents(startDate, endDate);

  // Filter for events assigned to the current user and in the future
  const userEvents = allEvents
    .filter((event: any) => {
      const isAssigned = event.assignments?.some(
        (assignment: any) => String(assignment.memberId) === String(memberId)
      );
      const eventStart = new Date(event.startDate);
      return isAssigned && eventStart >= startDate;
    })
    .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  // Map to job card format
  const jobs = userEvents.map((event: any) => ({
    name: event.title,
    time: event.startDate,
  }));

  // Fetch inventory items and filter for low stock
  let inventory = [];
  try {
    const inventoryRequest = await api.get('/inventory/1');
    inventory = inventoryRequest.data
      .filter((item: any) => item.currentStock <= item.minStock)
      .map((item: any) => ({
        name: item.item.name,
        remaining: item.currentStock,
        minStock: item.minStock,
      }));
  } catch (error) {
    console.error('Error fetching inventory data:', error);
  }

  return (
    <DashboardClient
      user={user}
      announcements={announcements}
      members={members}
      jobs={jobs}
      inventory={inventory}
    />
  );
} 