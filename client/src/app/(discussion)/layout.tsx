'use client'

import React from 'react'

import Searchbar from './components/Searchbar'
import Header from '../home/header'
import Footer from '../home/footer'
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