'use client'

import { useEffect, useState } from "react";
import { redirect, usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import api from '@/lib/api';

import { loggedInsiteConfig, loggedOutsiteConfig } from "@/config/site";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetHeader,
  SheetClose
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


export default function Header() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeLink, setActiveLink] = useState('#');
  const [isLabManager, setIsLabManager] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const user = await getUserFromSession();
      if (user) {
        user.role = await ResolveRoleName(user.roleId);
        setUserData(user);
        setIsLoggedIn(true);
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

  const handleLinkClick = (href: string) => setActiveLink(href);

  const handleLogout = async () => {
    if (isLoggedIn) {
      await api.get("/auth/logout");
      setIsLoggedIn(false);
      redirect('/home');
    }
  };

  const handleProfile = async () => {
    if (isLoggedIn) {
      const user = await getUserFromSession();
      redirect(`/profile/${user.id}`);
    }
  };

  const handleLabChange = (labId: number) => {
    console.log('Switched to lab:', labId);
    
    // Check if we're currently on a manage lab page
    const manageLabMatch = pathname.match(/^\/admin\/manage-lab\/(\d+)$/);
    
    // Refresh user data to get the new lastViewedLabId
    const getUser = async () => {
      const user = await getUserFromSession();
      if (user) {
        user.role = await ResolveRoleName(user.roleId);
        setUserData(user);
        
        // If on a manage lab page navigate to the new lab's manage page
        if (manageLabMatch) {
          router.push(`/admin/manage-lab/${labId}`);
        }
      }
    };
    getUser();
  };

  const navItems = isLoggedIn ? loggedInsiteConfig.navItems : loggedOutsiteConfig.navItems;

  // Check if user has admin role
  const isAdmin = userData?.role === 'Admin';

  // Show manage lab link if user is admin OR lab manager
  const showManageLab = isAdmin || isLabManager;

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
          <ModeSwitch />
          {userData && <NotificationBell userId={userData.id + ''} />}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-12 h-12 p-0">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[350px] py-10 flex flex-col justify-between">
              <div>
                {/* Header */}
                <SheetHeader className="items-center justify-center text-center mb-6">
                  <SheetTitle className="sr-only">
                    {isLoggedIn ? `Navigation Menu - ${userData?.username}` : 'Labchat Navigation Menu'}
                  </SheetTitle>
                  <SheetClose asChild>
                    {isLoggedIn ? (
                      <div className="flex items-center space-x-3">
                        <Button onClick={handleProfile} variant="outline" className="w-12 h-12 overflow-hidden">
                          <img src="/default_pfp.svg" alt="User" />
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
                </SheetHeader>

                {/* Lab Switcher (Mobile) */}
                {isLoggedIn && userData && (
                  <div className="px-4 py-4 border-b">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Switch Lab:</p>
                    <SimpleLabSwitcher
                      userId={userData.id}
                      onLabChange={handleLabChange}
                      placeholder="Select lab..."
                      className="w-full"
                    />
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

                  {/* Admin Panel Link - Only visible for admin users */}
                  {isAdmin && (
                    <SheetClose asChild>
                      <Link
                        href="/admin/dashboard"
                        prefetch={false}
                        onClick={() => handleLinkClick('/admin/dashboard')}
                      >
                        <Button
                          variant="outline"
                          className={`w-full ${activeLink === '/admin/dashboard' ? 'text-labchat-magenta-500' : ''}`}
                        >
                          Admin Panel
                        </Button>
                      </Link>
                    </SheetClose>
                  )}

                  {/* Manage Lab Link - Visible for admin users OR lab managers */}
                  {showManageLab && userData?.lastViewedLabId && (
                    <SheetClose asChild>
                      <Link
                        href={`/admin/manage-lab/${userData.lastViewedLabId}`}
                        prefetch={false}
                        onClick={() => handleLinkClick(`/admin/manage-lab/${userData.lastViewedLabId}`)}
                      >
                        <Button
                          variant="outline"
                          className={`w-full ${activeLink === `/admin/manage-lab/${userData.lastViewedLabId}` ? 'text-labchat-magenta-500' : ''}`}
                        >
                          Manage Lab
                        </Button>
                      </Link>
                    </SheetClose>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              {isLoggedIn && (
                <div className="px-4 pb-4 space-y-3">
                  <Button variant="outline" className="w-full" onClick={handleProfile}>
                    My Profile
                  </Button>
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