import React from 'react'

import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSessionServer from '@/lib/get_user_server'
import { redirect } from 'next/navigation'
import TopicClient from '../../../components/clients/TopicClient'
import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import { CategoryType } from '@/types/category.type'
import { PostType } from '@/types/post.type'


const DiscussionTopic = async ({ params }:{ params: { id: number }}) => {
    const { id } = await params
    await setUsersLastViewed(`/discussion/topic/${ id }`)
    
    const user = await getUserFromSessionServer()

    const roleResponse: AxiosResponse = await api.get(`/role/get/${ user.roleId }`)
    const userPermission = roleResponse.data.permissionLevel

    const categoryRequest: AxiosResponse = await api.get(`/discussion/categories/${ id }`)
    const category: CategoryType = categoryRequest.data

    if (!user || (category.visiblePermission ?? 0 ) > userPermission) {
        redirect('/home')
    }

    const postsRequest: AxiosResponse = await api.get(`/discussion/category-posts/${ id }`)
    const posts: PostType[] = postsRequest.data

    return (
      <TopicClient params={ {id: `${ id }`} } user={ user } userPermission={ userPermission } category={ category } posts={ posts } />
    )
  }

export default DiscussionTopic