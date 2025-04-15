'use client'

import Image from "next/image";

import frank from '../../../public/frank.svg';
import squaremenu from '../../../public/square-menu.svg';

import api from '@/lib/api';
import { useEffect, useState } from "react";

export default function Header() {
  const [userData, setUserData] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await api.get("/api/auth/status")
        const data = res.data

        setUserData(data)
        setIsLoggedIn(true)
      } catch (err) {
        console.log("No current session!")
      }
    }

    checkAuthStatus()
  }, [])

  const handleLogout = () => {
    if (isLoggedIn) {
      api.get("/api/auth/logout")
      setIsLoggedIn(false)
    }
  }

  return (
    <header className="flex items-center justify-between shadow-md border-b border-gray-300 bg-[#F5F7FA] py-4">
      <Image
        className="ml-10"
        src={ frank.src  }
        alt="Frank the Flask"
        width={ 64 }
        height={ 64 }
        priority />

      <h1 className="text-[#284AA3] text-4xl font-bold mr-12 play-font absolute left-1/2 transform -translate-x-1/2">Labchat</h1>

      <div>
        { isLoggedIn && 
          <div>
            <p>{ userData.displayName }</p>
            <button onClick={ handleLogout }>Log out</button> 
          </div>
        }

        <Image
          className="mr-4"
          src={ squaremenu.src  }
          alt="Burger Menu Icon"
          width={ 48 }
          height={ 48 } />
      </div>
    </header>
  );
}
