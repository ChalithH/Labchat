import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers'
import setUsersLastViewed from '@/lib/set_last_viewed';
import getUserFromSessionServer from '@/lib/get_user_server';
import DashboardClient from './components/DashboardClient';
import ResolveRoleName from '@/lib/resolve_role_name.util';
import { LabProvider } from '@/contexts/lab-context';

export default async function DashboardPage() {
  setUsersLastViewed('/dashboard');

  const sessionUser = await getUserFromSessionServer();
  if (!sessionUser) {
    redirect('/home');
  }

  // Check admin permission using the new endpoint
  const cookieStore = await cookies()
  const cookieHeaderString = cookieStore.toString()

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiBaseUrl) {
    console.error("CRITICAL: NEXT_PUBLIC_API_URL is not set. Cannot perform authorization check.")
    redirect('/home')
    return
  }

  let hasAdminPermission = false

  try {
    const response = await fetch(`${apiBaseUrl}/auth/check-admin-permission`, {
      headers: {
        ...(cookieHeaderString ? { 'cookie': cookieHeaderString } : {}),
      },
    })

    if (response.ok) {
      const data = await response.json()
      hasAdminPermission = data.hasAdminPermission
    } else {
      console.warn('Admin permission check failed:', response.status)
    }
  } catch (error) {
    console.error('Error checking admin permission:', error)
  }

  if (hasAdminPermission) {
    redirect('/admin/dashboard')
    return
  }


  const userRoleName = sessionUser.roleId
    ? await ResolveRoleName(sessionUser.roleId)
    : sessionUser.jobTitle || "Lab Member";

  const userActiveStatus = sessionUser.status && Array.isArray(sessionUser.status)
    ? sessionUser.status.find((s: any) => s.isActive)
    : null;
  const userPrimaryStatusName = userActiveStatus ? userActiveStatus.status.statusName : "No Status";

  // Ensure lastViewedLabId is a number, default to 1 if not present or invalid
  const lastViewedLabId = sessionUser.lastViewedLabId && !isNaN(parseInt(sessionUser.lastViewedLabId))
    ? parseInt(sessionUser.lastViewedLabId)
    : 1;

  const dashboardUser = {
    firstName: sessionUser.firstName,
    image: sessionUser.image,
    role: userRoleName,
    statusName: userPrimaryStatusName,
    memberID: sessionUser.memberId, // This might be null if not directly on sessionUser
    lastViewedLabId: lastViewedLabId,
    userId: sessionUser.id, // Pass userId to fetch memberId client-side if needed
  };

  // All data fetching will now happen in DashboardClient
  return (
    <LabProvider initialLabId={lastViewedLabId}>
      <DashboardClient
        user={dashboardUser}
      />
    </LabProvider>
  );
} 