import React from 'react'

import HomeClient from './HomeClient'
import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSessionServer from '@/lib/get_user_server'
import { redirect } from 'next/navigation'


const DiscussionHome = async () => {
    setUsersLastViewed(`/discussion/home`)

    const user = await getUserFromSessionServer()
    if (!user) {
      redirect('/home')
    }
  
    return (
      <HomeClient />
    )
  }

export default DiscussionHome