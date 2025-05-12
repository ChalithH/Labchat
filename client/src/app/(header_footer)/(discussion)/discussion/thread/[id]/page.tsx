import React from 'react'

import ThreadClient from '../../../components/ThreadClient'
import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSessionServer from '@/lib/get_user_server'
import { redirect } from 'next/navigation'
import api from '@/lib/api'


const DiscussionThread = async ({ params }:{ params: { id: number }}) => {
    const { id } = await params
    setUsersLastViewed(`/discussion/thread//${ id }`)
    
    const user = await getUserFromSessionServer()
    if (!user) {
        redirect('/home')
    }

    const post = await api.get(`/discussion/post/${ id }`)

    return (
      <ThreadClient post={ post } params={ {id: `${ id }`} } />
    )
  }

export default DiscussionThread