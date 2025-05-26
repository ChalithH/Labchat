'use client'

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import api from '@/lib/api';

import { loggedInsiteConfig, loggedOutsiteConfig } from "@/config/site";

import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetHeader, SheetDescription, SheetClose } from "@/components/ui/sheet"
import { ModeSwitch } from "@/components/ui/mode-switch";
import { Button } from "@/components/ui/button"
import { Badge } from "../ui/badge";

import ResolveRoleName from "@/lib/resolve_role_name.util";
import getUserFromSession from "@/lib/get_user";

import { NotificationBell } from "./NotificationBell";
import { MenuIcon } from "lucide-react";
import frank from '/public/FrankIcon.svg';
import React from "react";


export default function Header() {
  const [userData, setUserData] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeLink, setActiveLink] = useState('#');

  useEffect( () => {
    const getUser = async () => {
      const user = await getUserFromSession()

      if (user) {
        const role = await ResolveRoleName(user.roleId)
        user.role = role
        setUserData(user)
        setIsLoggedIn(true)
      }
    }

    getUser()
  }, [])

  const handleLinkClick = (href: string) => {
    setActiveLink(href);
  };

  const handleLogout = () => {
    if (isLoggedIn) {
      api.get("/auth/logout")

      setIsLoggedIn(false)
      redirect('/home')
    }
  }

  const handleProfile = async () => {
    if (isLoggedIn) {
      const user = await getUserFromSession()
      redirect(`/profile/${user.id}`)
    }
  }
  

  return (
    <header className="sticky top-0 z-50 w-full bg-zinc-200/70 dark:bg-zinc-900/70 shadow-sm border-b-[1px] ">
      <div className="container mx-auto flex h-24 items-center justify-between px-8">
        <div className="flex flex-col sm:flex-row items-center gap-1 md:gap-4 ">
          <Image
            src={ frank.src }
            alt="Frank the Flask"
            height={48}
            width={48}
            className=""
          />
          <h1 className="text-labchat-blue-500 text-xl md:text-3xl font-bold play-font text-center sm:text-left">Labchat</h1>
        </div>

          
        <div className="flex items-center gap-4">    
          <ModeSwitch />

          { userData && <NotificationBell userId={ userData.id + '' } /> }

          <Sheet>
            <SheetTitle className='hidden'>Menu</SheetTitle>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-12 h-12">
                <MenuIcon className="h-12 w-12" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[350px] py-10">
            <SheetHeader className='flex items-center justify-center'>
              <SheetClose asChild>
                { isLoggedIn ?
                  <div className='flex items-center space-x-2'>
                      <Button onClick={ handleProfile } variant="outline" className="w-12 h-12 overflow-hidden">
                        <img src="/default_pfp.svg" className='scale-420' alt="" />
                      </Button>
                      <div className='flex flex-col items-center justify-between'>
                        <Badge>{ userData.role }</Badge>
                        <p className="font-semibold play-font">{ userData.username }</p>
                      </div>
                  </div>
                :
                  <Link href="#" className="flex items-center gap-2" prefetch={false}>
                    <span className="text-2xl font-bold play-font text-labchat-blue-500">Labchat Navigation</span>
                  </Link>
                }
                  

              </SheetClose>
              <SheetDescription className='hidden'>Description goes here</SheetDescription>
            </SheetHeader>
              <div className="flex flex-col justify-between text-center items-center h-[100%]">
                <div className="flex flex-col gap-4 w-[100%]">
                  {/* Conditionally render navigation links based on login status */}
                  {isLoggedIn ? (
                    // Render logged-in navigation links
                    loggedInsiteConfig.navItems.map((item, index) => (
                      <SheetClose key={index} asChild>
                        <Link 
                          href={`${item.href}`}
                          className={`text-sm font-medium hover:text-muted-foreground hover:underline ${activeLink === item.href ? 'text-labchat-magenta-500' : ''}`} 
                          prefetch={false} 
                          onClick={() => handleLinkClick(item.href)}>
                            <Button variant='outline' className='w-[90%] cursor-pointer'>{item.title}</Button>
                        </Link>
                      </SheetClose>
                    ))
                  ) : (
                    // Render logged-out navigation links
                    loggedOutsiteConfig.navItems.map((item, index) => (
                      <SheetClose key={index} asChild>
                        <Link 
                          href={`${item.href}`}
                          className={`text-base font-medium hover:text-muted-foreground hover:underline ${activeLink === item.href ? 'text-labchat-magenta-500' : ''}`} 
                          prefetch={false} 
                          onClick={() => handleLinkClick(item.href)}>
                            {item.title}
                        </Link>
                      </SheetClose>
                    ))
                  )}
                </div>
                
                {/* Add logout button to the navigation menu if logged in */}
                {isLoggedIn && (
                  <div className='w-[100%]'>
                    <Button variant='outline' className='mb-2 cursor-pointer w-[90%]' onClick={ handleProfile }>
                      My Profile
                    </Button>

                    <SheetClose asChild>
                      <Button 
                        variant='destructive'
                        className="w-[90%] cursor-pointer text-sm font-medium text-white hover:underline"
                        onClick={handleLogout}>
                        Log out
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
            
          {/* User profile and logout buttons - only shown when logged in */}
          {isLoggedIn && 
            <div className="flex items-center justify-between gap-4 mt-2">
              {/* <button 
                className="cursor-pointer bg-sky-500 text-white p-2 rounded-md"
                onClick={handleProfile}>
                  <strong>Profile</strong><br />{userData.displayName}</button>  */}
            </div>
          }
        </div>
      </div>    
    </header>
  )
}