import React from 'react'

import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSessionServer from '@/lib/get_user_server'
import { redirect } from 'next/navigation'
import api from '@/lib/api'
import ThreadClient from '../../../components/clients/ThreadClient'
import { AxiosResponse } from 'axios'
import { PostType } from '@/types/post.type'
// import { ReplyType } from '@/types/reply.type'
import { UserType } from '@/types/User.type'
import ResolveRoleName from '@/lib/resolve_role_name.util'

type ReplyType = {
  id: number
  postId: number
  memberId: number
  content: string
  createdAt: string
  updatedAt: string
  member: {
    id: number
    userId: number
    user: UserType
  }
}

const DiscussionThread = async ({ params }:{ params: { id: number }}) => {
    const { id } = await params
    await setUsersLastViewed(`/discussion/thread/${ id }`)
    
    const user = await getUserFromSessionServer()
    if (!user) {
        redirect('/home')
    }

    const postResponse: AxiosResponse = await api.get(`/discussion/post/${ id }`)
    const post: PostType = postResponse.data

    const categoryResponse: AxiosResponse = await api.get(`/discussion/categories/${ post.discussionId }`)
    const category = categoryResponse.data

    const replyResponse: AxiosResponse = await api.get(`/discussion/replies/post/${ id }`)
    const replies: ReplyType[] = replyResponse.data

    const authorResponse: AxiosResponse = await api.get(`/user/get/${ post.member.userId }`)
    const author: UserType = authorResponse.data

    const userRole = await ResolveRoleName(user.roleId)
    const authorRole = await ResolveRoleName(author.roleId)

    const member = await api.get(`/member/get/user/${ user.id }`)

    return (
      <ThreadClient 
        post={ post } 
        category={ category.name }
        replies={ replies } 
        replyUsers={ replies.map(reply => reply.member.user) }
        author={ author } 
        authorRole={ authorRole } 
        user={ user } 
        userRole={ userRole }
        member={ member.data }
      />
    )
  }

export default DiscussionThread