import React from 'react'

import Searchbar from './components/Searchbar'

const DiscussionLayout = ({ children } : Readonly<{ children: React.ReactNode }>) => {
  return (
    <>
      <Searchbar />

      <div className='mb-4'>
        { children }
      </div>
    </>
  )
}

export default DiscussionLayout