'use client'

import React from 'react'

import Searchbar from './components/Searchbar'
import Header from '../../components/labchat/header'
import Footer from '../../components/labchat/footer'
import { BreadcrumbProvider } from './context/BreadcrumbContext'

const DiscussionLayout = ({ children } : Readonly<{ children: React.ReactNode }>) => {
  return (
    <>
      <BreadcrumbProvider>
        <Header />
        <Searchbar />

        { children }

        <Footer />
      </BreadcrumbProvider>
    </>
  )
}

export default DiscussionLayout