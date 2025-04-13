'use client'

import React from 'react'

import Header from '../../components/labchat/header'
import Footer from '../../components/labchat/footer'
import { BreadcrumbProvider } from './(discussion)/context/BreadcrumbContext'

const CommonLayout = ({ children } : Readonly<{ children: React.ReactNode }>) => {
  return (
    <>
      <BreadcrumbProvider>
        <Header />

        { children }

        <Footer />
      </BreadcrumbProvider>
    </>
  )
}

export default CommonLayout