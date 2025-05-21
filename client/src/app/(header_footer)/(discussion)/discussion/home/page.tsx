import React from 'react'

import { redirect } from 'next/navigation'
import { AxiosResponse } from 'axios'

import { PostType } from '@/types/post.type'
import { CategoryType } from '@/types/category.type'

import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSession from '@/lib/get_user' 

import HomeClient from '../../components/clients/HomeClient'
import api from '@/lib/api'



const DiscussionHome = async () => {
    setUsersLastViewed(`/discussion/home`)

    const user = await getUserFromSession()
    if (!user) {
      redirect('/home')
    }

    const recentActivityRequest: AxiosResponse = await api.get('/discussion/recent/9')
    const recentActivity: PostType[] = recentActivityRequest.data

    const categoriesRequest: AxiosResponse = await api.get('/discussion/tags')
    const categories: CategoryType[] = categoriesRequest.data

    const posts: PostType[][] = await Promise.all(
      categories.map(async (category) => {
        const response: AxiosResponse = await api.get(`/discussion/category-posts/${category.id}`)
        return response.data
      })
    )

    return (
      <HomeClient recentActivity={ recentActivity } categories={ categories } posts={ posts }/>
    )
  }

export default DiscussionHome