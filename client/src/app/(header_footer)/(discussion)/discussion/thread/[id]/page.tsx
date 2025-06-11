import React from 'react'

import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSessionServer from '@/lib/get_user_server'
import { redirect } from 'next/navigation'
import api from '@/lib/api'
import ThreadClient from '../../../components/clients/ThreadClient'
import { AxiosResponse } from 'axios'
import { DiscussionPostState, PostType } from '@/types/post.type'
import { ReplyType } from '@/types/reply.type'
import ResolveRoleName from '@/lib/resolve_role_name.util'
import { PermissionConfig } from '@/config/permissions'
import { LabProvider } from '@/contexts/lab-context'


type Params = Promise<{ id: number }>

const DiscussionThread = async (props:{ params: Params}) => {
    const params = await props.params
    const id  = params.id

    await setUsersLastViewed(`/discussion/thread/${ id }`)
    
    const user = await getUserFromSessionServer()
    const currentLabId = user.lastViewedLabId || 1
    const memberResponse = await api.get(`/member/get/user-lab/${ user.id }/${ currentLabId }`)
    
    const roleResponse: AxiosResponse = await api.get(`/lab/role/${ memberResponse.data.labId }/${ memberResponse.data.labRoleId }`)
    const userPermission = roleResponse.data.permissionLevel

    const postResponse: AxiosResponse = await api.get(`/discussion/post/${ id }`)
    const post: PostType = postResponse.data

    const categoryResponse: AxiosResponse = await api.get(`/discussion/categories/${ post.discussionId }`)
    const category = categoryResponse.data

    const replyResponse: AxiosResponse = await api.get(`/discussion/replies/post/${ id }`)
    const replies: ReplyType[] = replyResponse.data

    const userRole: string = roleResponse.data.name

    const visiblePermission = category.visiblePermission ?? 0

    const isNotVisible = userPermission < visiblePermission
    const isHidden = post.state === DiscussionPostState.HIDDEN
    const isWrongLab = category.labId !== currentLabId
    const canSeeHidden = userPermission >= PermissionConfig.SEE_HIDDEN_PERMISSION || post.member.userId === user.id
    const canSeeEverything = userPermission >= PermissionConfig.SEE_EVERYTHING_PERMISSION

    if (!user || (!canSeeEverything && (isNotVisible || isWrongLab || (isHidden && !canSeeHidden)))) {
      redirect('/home')
    }
    const authorRoleResponse: AxiosResponse = await api.get(`/lab/role/${ memberResponse.data.labId }/${ memberResponse.data.labRoleId }`)
    const authorRole = authorRoleResponse.data.name
    const member = await api.get(`/member/get/user/${ user.id }`)

    return (
      <LabProvider initialLabId={currentLabId}>
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
      </LabProvider>
    )
  }

export default DiscussionThread