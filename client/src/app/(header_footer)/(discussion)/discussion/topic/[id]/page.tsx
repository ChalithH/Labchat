import React from 'react'

import TopicClient from './TopicClient'
import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSessionServer from '@/lib/get_user_server'
import { redirect } from 'next/navigation'


const DiscussionTopic = async ({ params }:{ params: { id: number }}) => {
    const { id } = await params
    setUsersLastViewed(`/discussion/topic/${ id }`)
    
    const user = await getUserFromSessionServer()
    if (!user) {
        redirect('/home')
    }

    return (
      <TopicClient params={ {id: `${ id }`} } />
    )
  }

export default DiscussionTopic