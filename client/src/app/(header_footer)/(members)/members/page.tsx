import React from 'react'
import Members from './MembersPage'
import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSessionServer from '@/lib/get_user_server'
import { redirect } from 'next/navigation'


const MembersPage = async () => {
    setUsersLastViewed(`/members`)

    const user = await getUserFromSessionServer()
    if (user) { // make sure to change back to !user when auth is working
      redirect('/home')
    }
  
    return (
      <Members />
    )
  }

export default MembersPage