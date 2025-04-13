'use client'

import React from 'react'

import Header from '../home/header'
import Footer from '../home/footer'
import { BreadcrumbProvider } from '../(discussion)/context/BreadcrumbContext'

const InventoryLayout = ({ children } : Readonly<{ children: React.ReactNode }>) => {
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

export default InventoryLayout