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

    const postResponse: AxiosResponse = await api.get(`/discussion/post/${ id }`)
    const post: PostType = postResponse.data

    const categoryResponse: AxiosResponse = await api.get(`/discussion/categories/${ post.discussionId }`)
    const category = categoryResponse.data

    const replyResponse: AxiosResponse = await api.get(`/discussion/replies/post/${ id }`)
    const replies: ReplyType[] = replyResponse.data

    const roleResponse: AxiosResponse = await api.get(`/role/get/${ user.roleId }`) 
    const userRole: string = roleResponse.data.name

    if (!user || (category.visiblePermission ?? 0) > roleResponse.data.permissionLevel) {
      redirect('/home')
    }

    const authorRole = await ResolveRoleName(post.member.user.roleId)

    const member = await api.get(`/member/get/user/${ user.id }`)

    return (
      <ThreadClient 
        user={ user } 
        userRole={ userRole }
        userPermission={ roleResponse.data.permissionLevel }

        post={ post } 
        category={ category.name }
        replies={ replies } 

        replyUsers={ replies.map(reply => reply.member.user) }
        author={ post.member.user } 
        authorRole={ authorRole } 
        member={ member.data }
      />
    )
  }

export default DiscussionThread