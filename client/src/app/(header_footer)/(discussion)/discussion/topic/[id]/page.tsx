import React from 'react'

import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSessionServer from '@/lib/get_user_server'
import { redirect } from 'next/navigation'
import { LabProvider } from '@/contexts/lab-context'
import TopicClient from '../../../components/clients/TopicClient'
import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import { CategoryType } from '@/types/category.type'
import { PostType } from '@/types/post.type'
import { PermissionConfig } from '@/config/permissions'


type Params = Promise<{ id: number }>

const DiscussionTopic = async (props:{ params: Params}) => {
    const params = await props.params
    const id  =  params.id
    await setUsersLastViewed(`/discussion/topic/${ id }`)
    
    const user = await getUserFromSessionServer()
    const currentLabId = user.lastViewedLabId || 1
    
    if (!user.lastViewedLabId) {
      redirect('/admission');
    }

    const lab: AxiosResponse = await api.get(`/lab/${ user.lastViewedLabId }`)
    if (!lab) {
      redirect('/admission');
    }
    
    const member = await api.get(`/member/get/user-lab/${ user.id }/${ currentLabId }`)
    
    const roleResponse: AxiosResponse = await api.get(`/lab/role/${ member.data.labId }/${ member.data.labRoleId }`)
    const userPermission = roleResponse.data.permissionLevel

    const categoryRequest: AxiosResponse = await api.get(`/discussion/categories/${ id }`)
    const category: CategoryType = categoryRequest.data

    if (!user || ((category.labId != currentLabId) && PermissionConfig.SEE_EVERYTHING_PERMISSION > userPermission)) {
      redirect('/home')
    }
    const postsRequest: AxiosResponse = await api.get(`/discussion/category-posts/${ currentLabId }/${ id }`)
    const allPosts: PostType[] = postsRequest.data

    const posts = allPosts.filter(post => {
      if (post.state !== 'HIDDEN' || post.member.userId === user.id ) return true
      return userPermission >= PermissionConfig.HIDDEN_PERMISSION
    })

    return (
      <LabProvider initialLabId={currentLabId}>
        <TopicClient params={ {id: `${ id }`} } user={ user } userPermission={ userPermission } category={ category } posts={ posts } />
      </LabProvider>
    )
  }

export default DiscussionTopic