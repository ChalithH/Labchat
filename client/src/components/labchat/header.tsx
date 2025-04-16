'use client'

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";

import Image from "next/image";

import frank from '../../../public/frank.svg';
import squaremenu from '../../../public/square-menu.svg';

import getUserFromSession from "@/utils/getUserFromSession";
import api from '@/utils/api';


export default function Header() {
  const [userData, setUserData] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect( () => {
    const getUser = async () => {
      const user = await getUserFromSession()

      if (user) {
        setUserData(user)
        setIsLoggedIn(true)
      }
    }

    getUser()
  }, [])

  const handleLogout = () => {
    if (isLoggedIn) {
      api.get("/api/auth/logout")

      setIsLoggedIn(false)
      redirect('/home')
    }
  }

  return (
    <header className="flex flex-col justify-center items-center shadow-md border-b border-gray-300 bg-[#F5F7FA] py-4">
      <div className="flex justify-between items-center">
        <Image
          className="ml-10"
          src={ frank.src  }
          alt="Frank the Flask"
          width={ 64 }
          height={ 64 } />

        <h1 className="text-[#284AA3] text-4xl font-bold mr-12 play-font">Labchat</h1>

        <Image
          className="mr-4"
          src={ squaremenu.src  }
          alt="Burger Menu Icon"
          width={ 48 }
          height={ 48 } />
      </div>
      
      { isLoggedIn && 
        <div className="flex items-center justify-between gap-16">
          <p>{ userData.displayName }</p>
          <p>{ userData.id }</p>

          <button 
            className="bg-blue-300 p-2 rounded-sm"
            onClick={ handleLogout }>
              Log out</button> 
        </div>
      }
    </header>
  );
}
