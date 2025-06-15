'use client'

import { useEffect, useState } from "react";
import { redirect, usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import api from '@/lib/api';

import { loggedInsiteConfig, loggedOutsiteConfig, managerInsiteConfig, adminInsiteConfig, GuestSiteConfig } from "@/config/site";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetHeader,
  SheetClose,
  SheetDescription
} from "@/components/ui/sheet";

import { ModeSwitch } from "@/components/ui/mode-switch";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";

import ResolveRoleName from "@/lib/resolve_role_name.util";
import getUserFromSession from "@/lib/get_user";

import { NotificationBell } from "./NotificationBell";
import { MenuIcon } from "lucide-react";
import frank from '/public/FrankIcon.svg';

import React from "react";
import { SimpleLabSwitcher } from "@/components/labSwitcher/LabSwitcher"; 
import ProfilePicture from "../profilePicture/ProfilePicture";


export default function Header() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeLink, setActiveLink] = useState('#');
  const [isLabManager, setIsLabManager] = useState(false);
  const [isLabMember, setIsLabMember] = useState(false);
  const [memberData, setMemberData] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const user = await getUserFromSession();
      if (user) {
        user.role = await ResolveRoleName(user.roleId);
        setUserData(user);
        setIsLoggedIn(true);
        if (user.lastViewedLabId) { 
          setIsLabMember(true);
        }
      }
    };
    getUser();
  }, []);

  // Check lab manager permissions when userData/lastViewedLabId changes
  useEffect(() => {
    const checkLabPermissions = async () => {
      if (!isLoggedIn || !userData?.lastViewedLabId) {
        setIsLabManager(false);
        return;
      }

      try {
        const response = await api.get(`/auth/check-lab-access/${userData.lastViewedLabId}`);
        console.log('Lab access check response:', response.data);
        if (response.data && response.data.isLabManager) {
          setIsLabManager(true);
        } else {
          setIsLabManager(false);
        }
      } catch (error: any) {
        // 403 == user doesn't have permission
        if (error.response && error.response.status === 403) {
          setIsLabManager(false);
        } else {
          // Gracefully handle
          console.error('Failed to check lab permissions:', error);
          setIsLabManager(false);
        }
      }
    };

    checkLabPermissions();
    }, [userData?.lastViewedLabId, isLoggedIn, userData]);

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!isLoggedIn || !userData?.id || !userData?.lastViewedLabId) {
        setMemberData(null);
        return;
      }

      try {
        console.log(`Fetching member data for user ${userData.id} in lab ${userData.lastViewedLabId}`);
        
        // Get the member association
        const member = await api.get(`/member/get/user-lab/${userData.id}/${userData.lastViewedLabId}`);
        
        // Get the full member details including labRole
        const memberResponse = await api.get(`/member/get/${member.data.id}`);
        
        console.log('Member data with labRole:', memberResponse.data);
        setMemberData(memberResponse.data);
        
      } catch (error) {
        console.error('Failed to fetch member data:', error);
        setMemberData(null);
      }
    };

    fetchMemberData();
  }, [isLoggedIn, userData?.id, userData?.lastViewedLabId]);

  const handleLinkClick = (href: string) => setActiveLink(href);

 const handleLogout = async () => {
  if (isLoggedIn) {
    try {
      await api.get("/auth/logout");
      
      // Reset ALL related state
      setIsLoggedIn(false);
      setUserData(null);
      setIsLabManager(false);
      setActiveLink('#');
      
      // Use router.push instead of redirect for better state management
      router.push('/home');
      
      // Optional: Force a page refresh to ensure clean state
      // window.location.href = '/home';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
};

const handleProfile = async () => {
  if (!isLoggedIn || !userData) {
    return;
  }

  if (!userData.lastViewedLabId) { 
    router.push('/admission'); 
    return;
  } 

  try {
    const member = await api.get(`/member/get/user-lab/${userData.id}/${userData.lastViewedLabId}`);
    const memberResponse = await api.get(`/member/get/${member.data.id}`);
    router.push(`/profile/${member.data.id}`); 
  } catch (error) {
    router.push('/admission'); 
  }
};


  const handleLabChange = async (labId: number) => {
    console.log('Switched to lab:', labId);
    
    // Check if we're currently on a manage lab page
    const manageLabMatch = pathname.match(/^\/admin\/manage-lab\/(\d+)$/);
    
    // Check if we're on a profile page
    const profileMatch = pathname.match(/^\/profile\/(\d+)$/);
    
    try {
      // Refresh user data to get the new lastViewedLabId
      const user = await getUserFromSession();
      if (user) {
        user.role = await ResolveRoleName(user.roleId);
        setUserData(user);
        
        // If on a manage lab page navigate to the new lab's manage page
        if (manageLabMatch) {
          router.push(`/admin/manage-lab/${labId}`);
          return;
        }
        
        // If on a profile page, navigate to the user's profile in the new lab
        if (profileMatch) {
          try {
            const member = await api.get(`/member/get/user-lab/${user.id}/${labId}`);
            router.push(`/profile/${member.data.id}`);
            return;
          } catch (error) {
            console.error('Failed to get member data for new lab:', error);
            // Fall back to just refreshing the page
          }
        }
        
        // For other pages, just refresh
        router.refresh();
      }
    } catch (error) {
      console.error('Error handling lab change:', error);
      // Fallback: just refresh the page
      router.refresh();
    }
  };

  interface NavItem {
    title: string;
    href: string;
  }

  let navItems: NavItem[]; 
  // Check if user has admin role
  const isAdmin = userData?.role === 'Admin';

  if (isAdmin) {
    navItems = adminInsiteConfig.navItems;
  } else if (isLabManager) {
    const baseNavItems = managerInsiteConfig.navItems;
    navItems = [...baseNavItems];
    
    if (navItems.length > 0 && userData?.lastViewedLabId) {
      const lastIndex = navItems.length - 1;
      navItems[lastIndex] = {
        ...navItems[lastIndex],
        href: `${navItems[lastIndex].href}/${userData.lastViewedLabId}`
      };
    }
  } else if (isLabMember && isLoggedIn) {
    navItems = loggedInsiteConfig.navItems;
  } else if (!isLabMember && isLoggedIn) { 
    navItems = GuestSiteConfig.navItems; 
  } else { 
    navItems = loggedOutsiteConfig.navItems;
  }


  return (
    <header className="sticky top-0 z-50 w-full bg-zinc-200/70 dark:bg-zinc-900/70 shadow-sm border-b">
      <div className="container mx-auto flex h-24 items-center justify-between px-8">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-4">
          <Image src={frank.src} alt="Frank the Flask" height={48} width={48} />
          <h1 className="text-labchat-blue-500 text-xl md:text-3xl font-bold play-font">Labchat</h1>
        </div>

        {/* Center - Lab Switcher */}
        {isLoggedIn && userData && (
          <div className="hidden md:flex">
            <SimpleLabSwitcher
              userId={userData.id}
              onLabChange={handleLabChange}
              placeholder="Select lab..."
              className="w-56"
            />
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {userData && <NotificationBell userId={userData.id + ''} />}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-12 h-12 p-0">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[350px] p-0 flex flex-col h-full overflow-hidden">
              {/* Fixed Header */}
              <SheetHeader className="flex-shrink-0 items-center justify-center text-center p-6 border-b">
                <SheetTitle className="sr-only">
                  {isLoggedIn ? `Navigation Menu - ${userData?.username}` : 'Labchat Navigation Menu'}
                </SheetTitle>
                <SheetClose asChild>
                  {isLoggedIn ? (
                    <div className="flex items-center space-x-3">
                      <Button onClick={handleProfile} variant="ghost" className="w-12 h-12 overflow-hidden">
                         <ProfilePicture 
                              user_id={userData.id} 
                              profilePic={userData.profilePic} 
                              name={userData.firstName}
                              size={10} 
                          />
                      </Button>
                      <div className="flex flex-col items-center">
                        <Badge>{userData.role}</Badge>
                        <p className="font-semibold play-font">{userData.username}</p>
                      </div>
                    </div>
                  ) : (
                    <h2 className="text-2xl font-bold play-font text-labchat-blue-500">Labchat Navigation</h2>
                  )}
                </SheetClose>
                <SheetDescription>
                  {isLoggedIn ? `Welcome, ${userData?.firstName || 'User'}` : 'Explore our features and labs'}
                </SheetDescription>
              </SheetHeader>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Lab Switcher (Mobile) */}
                {isLoggedIn && userData && (
                  <div className="px-4 py-4 border-b flex-shrink-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Switch Lab:</p>
                    <SimpleLabSwitcher
                      userId={userData.id}
                      onLabChange={handleLabChange}
                      placeholder="Select lab..."
                      className="w-full"
                    />
                    {memberData?.labRole?.name && (
                        <div className=" flex flex-row justify-center items-center py-2 px-2">
                            <p>Lab role: </p>
                            <Badge variant="secondary">{memberData.labRole.name}</Badge>
                        </div>
                    )}
                  </div>
                )}

                {/* Nav Links */}
                <div className="flex flex-col gap-4 p-4">
                  {navItems.map((item, index) => (
                    <SheetClose key={index} asChild>
                      <Link
                        href={item.href}
                        prefetch={false}
                        onClick={() => handleLinkClick(item.href)}
                      >
                        <Button
                          variant="outline"
                          className={`w-full ${activeLink === item.href ? 'text-labchat-magenta-500' : ''}`}
                        >
                          {item.title}
                        </Button>
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </div>

              {/* Fixed Bottom Actions */}
              {isLoggedIn && (
                <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t space-y-3 bg-background">
                  {memberData && ( 
                  <SheetClose asChild>
                    <Button variant="outline" className="w-full" onClick={handleProfile}>
                      My Profile
                    </Button> 
                  </SheetClose>)}
                  <SheetClose asChild>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleLogout}
                    >
                      Log out
                    </Button>
                  </SheetClose>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}