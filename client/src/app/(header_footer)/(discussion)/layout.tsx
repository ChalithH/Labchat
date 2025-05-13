import React from 'react'

import Searchbar from './components/Searchbar'

const DiscussionLayout = ({ children } : Readonly<{ children: React.ReactNode }>) => {
  return (
    <>
      <Searchbar />

      { children }
    </>
  )
}

export default DiscussionLayout