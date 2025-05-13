import React from 'react'

import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSessionServer from '@/lib/get_user_server'
import { redirect } from 'next/navigation'
import api from '@/lib/api'
import ThreadClient from '../../../components/clients/ThreadClient'
import { AxiosResponse } from 'axios'
import { PostType } from '@/types/post.type'
import { ReplyType } from '@/types/reply.type'
import { UserType } from '@/types/User.type'
import ResolveRoleName from '@/lib/resolve_role_name.util'


const DiscussionThread = async ({ params }:{ params: { id: number }}) => {
    const { id } = await params
    setUsersLastViewed(`/discussion/thread//${ id }`)
    
    const user = await getUserFromSessionServer()
    if (!user) {
        redirect('/home')
    }


    const postResponse: AxiosResponse = await api.get(`/discussion/post/${ id }`)
    const post: PostType = postResponse.data

    const replyResponse: AxiosResponse = await api.get(`/discussion/replies/post/${ id }`)
    const replies: ReplyType[] = replyResponse.data

    const authorResponse: AxiosResponse = await api.get(`/user/get/${ user.id }`)
    const author: UserType = authorResponse.data

    const userRole = await ResolveRoleName(user.roleId)
    const authorRole = await ResolveRoleName(author.roleId)

    const replyUsers: UserType[] = await Promise.all(
      replies.map(async (reply) => {
        const res: AxiosResponse = await api.get(`/member/get/${ reply.memberId }`)
        const user: AxiosResponse = await api.get(`/user/get/${ res.data.userId }`)
        return user.data
    }))

    const member = await api.get(`/member/get/user/${ user.id }`)

    return (
      <ThreadClient 
        post={post} 
        replies={replies} 
        replyUsers={replyUsers}
        author={author} 
        authorRole={authorRole} 
        user={user} 
        userRole={userRole}
        member={member.data}
      />
    )
  }

export default DiscussionThread