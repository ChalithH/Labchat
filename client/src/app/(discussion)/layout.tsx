import React from 'react'

import Searchbar from './components/Searchbar'
import Header from '@/components/ui/header'
import Footer from '@/components/ui/footer'
import { BreadcrumbProvider } from './context/BreadcrumbContext'

const DiscussionLayout = ({ children } : Readonly<{ children: React.ReactNode }>) => {
  return (
    <>
      <BreadcrumbProvider>
        <Searchbar />

        { children }

      </BreadcrumbProvider>
    </>
  )
}

export default DiscussionLayout