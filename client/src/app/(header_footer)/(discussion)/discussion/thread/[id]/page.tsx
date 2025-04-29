import React from 'react'

import ThreadClient from './ThreadClient'
import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSessionServer from '@/lib/get_user_server'
import { redirect } from 'next/navigation'


const DiscussionThread = async ({ params }:{ params: { id: number }}) => {
    const { id } = await params
    setUsersLastViewed(`/discussion/thread//${ id }`)
    
    const user = await getUserFromSessionServer()
    if (!user) {
        redirect('/home')
    }

    return (
      <ThreadClient params={ {id: `${ id }`} } />
    )
  }

export default DiscussionThread