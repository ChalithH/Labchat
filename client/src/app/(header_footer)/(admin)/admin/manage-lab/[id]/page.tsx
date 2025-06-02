import getUserFromSessionServer from "@/lib/get_user_server";
import { redirect } from "next/navigation";
import setUsersLastViewed from "@/lib/set_last_viewed";
import ManageLabClient from "./ManageLabClient";
import React from 'react';
import { cookies } from 'next/headers';



interface ManageLabPageProps {
  params: Promise<{ id: string }>;
}

const ROOT_ADMIN_PERMISSION_LEVEL = 100; 
const LAB_MANAGER_PERMISSION_LEVEL = 70; 

export default async function ManageLabPage({ params: paramsPromise }: ManageLabPageProps) {
  const params = await paramsPromise;
  const labIdStr = params.id;
  const labIdInt = parseInt(labIdStr, 10);

  if (isNaN(labIdInt)) {
    redirect('/dashboard'); // Invalid lab ID format
    return;
  }

  // Check if a user session exists
  const sessionUser = await getUserFromSessionServer();
  if (!sessionUser || !sessionUser.id) {
    redirect('/home');
    return;
  }

  const cookieStore = await cookies();
  const cookieHeaderString = cookieStore.toString(); 

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL; 
  if (!apiBaseUrl) {
    console.error("CRITICAL: NEXT_PUBLIC_API_URL is not set. Cannot perform authorization check.");
    redirect('/error-page'); // Redirect to a generic error page/handle appropriately
    return; 
  }
  const authCheckUrl = `${apiBaseUrl}/auth/check-lab-access/${labIdStr}`;

  

  let apiResponseData: { authorized: boolean; isRootAdmin?: boolean; isLabManager?: boolean; error?: string };

  try {
    const response = await fetch(authCheckUrl, {
      headers: {
        ...(cookieHeaderString ? { 'cookie': cookieHeaderString } : {}), 
      },
    });

    if (response.ok) {
      apiResponseData = await response.json();
    } else {
      const errorText = await response.text();
      console.error(`Authorization check API call failed: ${response.status} - ${errorText}`);
      
      apiResponseData = { authorized: false, error: `API Error: ${response.status}` };
    }
  } catch (error) {
    console.error('Network or other error during authorization fetch:', error);
    // Treat as unauthorized on network issues
    apiResponseData = { authorized: false, error: 'Network error during auth check' };
  }

  if (!apiResponseData.authorized) {
    console.warn(`User not authorized for lab ${labIdStr}. Reason: ${apiResponseData.error || 'No specific reason from API'}. Redirecting to dashboard.`);
    redirect('/dashboard'); // Not authorized for this specific lab, or an error occurred
    return;
  }

  // At this point, apiResponseData.authorized is true
  // Check the specific roles based on API response

  if (apiResponseData.isRootAdmin) {
    // User is a Root Admin. Allow access
    // No redirect, proceed to render <ManageLabClient />
  } else if (apiResponseData.isLabManager) {
    // User is a Lab Manager for this lab. Allow access
    // No redirect, proceed to render <ManageLabClient />
  } else {
    // API = 'authorized: true' but didn't specify recognized role
    
    console.warn(`User authorized for lab ${labIdStr} but not identified as Root Admin or specific Lab Manager. Defaulting to redirect.`);
    redirect('/dashboard');
    return;
  }

  await setUsersLastViewed(`/admin/manage-lab/${labIdStr}`);

  return <ManageLabClient params={params} isRootAdmin={apiResponseData.isRootAdmin || false} />;
} 