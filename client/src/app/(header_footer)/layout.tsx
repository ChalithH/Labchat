import React from 'react'

import Footer from '@/components/labchat/footer'
import Header from '@/components/labchat/header'
import { Toaster } from 'sonner'

const HeaderFooterLayout = ({ children } : Readonly<{ children: React.ReactNode }>) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
        <main className="flex-grow">
          {children}
        </main>
      <Toaster />
      <Footer />
    </div>
  )
}

export default HeaderFooterLayout