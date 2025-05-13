import React from 'react'

import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSessionServer from '@/lib/get_user_server'
import { redirect } from 'next/navigation'
import TopicClient from '../../../components/clients/TopicClient'
import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import { CategoryType } from '@/types/category.type'
import { PostType } from '@/types/post.type'

type Params = Promise<{ id: number }>

const DiscussionTopic = async (props:{ params: Params}) => {
    const params = await props.params
    const id = params.id

    setUsersLastViewed(`/discussion/topic/${ id }`)
    
    const user = await getUserFromSessionServer()
    if (!user) {
        redirect('/home')
    }

    const categoryRequest: AxiosResponse = await api.get(`/discussion/tags/${ id }`)
    const category: CategoryType = categoryRequest.data

    const postsRequest: AxiosResponse = await api.get(`/discussion/category-posts/${ id }`)
    const posts: PostType[] = postsRequest.data

    return (
      <TopicClient params={ {id: `${ id }`} } category={ category } posts={ posts } />
    )
  }

export default DiscussionTopic