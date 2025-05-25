import React from 'react';
import { redirect } from 'next/navigation';
import setUsersLastViewed from '@/lib/set_last_viewed';
import getUserFromSessionServer from '@/lib/get_user_server';
import DashboardClient from './components/DashboardClient';
import api from '@/lib/api';
import { startOfMonth, endOfMonth } from 'date-fns';
import { getEvents } from '@/app/(header_footer)/(calendar)/requests';
import { PostType } from '@/types/post.type';
import ResolveRoleName from '@/lib/resolve_role_name.util';
import type { Member } from './components/types';

export default async function DashboardPage() {
  setUsersLastViewed('/dashboard');

  const sessionUser = await getUserFromSessionServer();
  // console.log("SESSION USER DATA IN DASHBOARD PAGE:", JSON.stringify(sessionUser, null, 2));
  if (!sessionUser) {
    redirect('/home');
  }

  const userRoleName = sessionUser.roleId
    ? await ResolveRoleName(sessionUser.roleId)
    : sessionUser.jobTitle || "Lab Member";
  
  // Extract primary status for the logged-in user
  const userActiveStatus = sessionUser.status && Array.isArray(sessionUser.status) 
    ? sessionUser.status.find((s: any) => s.isActive) 
    : null;
  const userPrimaryStatusName = userActiveStatus ? userActiveStatus.status.statusName : "No Status";

  let memberId = sessionUser.memberId;

  if (!memberId && sessionUser.id) {
    try {
      const memberRes = await api.get(`/member/get/user/${sessionUser.id}`);
      memberId = memberRes.data.id;
    } catch (error) {
      console.error('Error fetching member data:', error);
      memberId = null;
    }
  }

  const dashboardUser = {
    firstName: sessionUser.firstName,
    image: sessionUser.image,
    role: userRoleName,
    statusName: userPrimaryStatusName,
    memberID: memberId,
  };

  // Fetch posts from the Announcements topic (topic 1)
  const topicAnnouncementsRequest = await api.get('/discussion/category-posts/1');
  const posts = topicAnnouncementsRequest.data.filter((post: any) => post.isAnnounce);

  const announcements: PostType[] = posts.map((post: any) => ({
    id: post.id,
    discussionId: post.discussionId,
    memberId: post.memberId,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    isPinned: post.isPinned,
    isAnnounce: post.isAnnounce
  }));

  // Fetch member and user info for each announcement
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
      authorRole = userData.roleId ? await ResolveRoleName(userData.roleId) : (userData.jobTitle || 'User');
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

  const initialMembers: Member[] = []; 
  
  // Fetch all events for the lab (from today to a month from now)
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);
  const allEvents = await getEvents(startDate, endDate);

  const userEvents = allEvents
    .filter((event: any) => {
      const isAssigned = event.assignments?.some(
        (assignment: any) => String(assignment.memberId) === String(memberId)
      );
      const eventStart = new Date(event.startDate);
      return isAssigned && eventStart >= startDate;
    })
    .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    // .slice(0, 5);

  const jobs = userEvents.map((event: any) => ({
    name: event.title,
    time: event.startDate,
  }));

  let inventory = [];
  try {
    const inventoryRequest = await api.get('/inventory/1');
    inventory = inventoryRequest.data
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
  } catch (error) {
    console.error('Error fetching inventory data:', error);
  }

  let currentUserMember = null;
  if (memberId) {
    try {
      const memberRes = await api.get(`/member/get/${memberId}`);
      currentUserMember = memberRes.data;
    } catch (error) {
      console.error('Error fetching current user member data:', error);
    }
  }

  return (
    <DashboardClient
      user={dashboardUser}
      announcements={announcementsInfo}
      members={initialMembers}
      jobs={jobs}
      inventory={inventory}
    />
  );
} 