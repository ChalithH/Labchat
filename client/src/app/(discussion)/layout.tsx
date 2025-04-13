import React from 'react'

import Searchbar from './components/Searchbar'
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