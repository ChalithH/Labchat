import React from 'react'

import Footer from '@/components/labchat/footer'
import Header from '@/components/labchat/header'

const HeaderFooterLayout = ({ children } : Readonly<{ children: React.ReactNode }>) => {
  return (
    <>
      <Header />
        { children }
      <Footer />
    </>
  )
}

export default HeaderFooterLayout