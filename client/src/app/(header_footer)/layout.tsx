import React from 'react'

import Footer from '@/components/labchat/footer'
import Header from '@/components/labchat/header'
import { Toaster } from "@/components/ui/sonner"

const HeaderFooterLayout = ({ children } : Readonly<{ children: React.ReactNode }>) => {
  return (
    <>
      <Header />
        { children }
      <Toaster />
      <Footer />
    </>
  )
}

export default HeaderFooterLayout