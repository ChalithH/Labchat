import React from 'react'

import Searchbar from './components/Searchbar'
import Header from '../home/header'
import Footer from '../home/footer'

const DiscussionLayout = ({ children } : Readonly<{ children: React.ReactNode }>) => {
  return (
    <>
      <Header />
      <Searchbar />

      { children }

      <Footer />
    </>
  )
}

export default DiscussionLayout