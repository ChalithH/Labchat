import React from 'react'

import { redirect } from 'next/navigation'
import { AxiosResponse } from 'axios'

import { PostType } from '@/types/post.type'
import { CategoryType } from '@/types/category.type'

import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSessionServer from '@/lib/get_user_server'

import HomeClient from '../../components/clients/HomeClient'
import api from '@/lib/api'



const DiscussionHome = async () => {
    await setUsersLastViewed(`/discussion/home`)

    const user = await getUserFromSessionServer()
    if (!user) {
      redirect('/home')
    }

    const roleResponse: AxiosResponse = await api.get(`/role/get/${ user.roleId }`)
    const userPermission = roleResponse.data.permissionLevel

    const recentActivityRequest: AxiosResponse = await api.get('/discussion/recent/9')
    const recentActivity: PostType[] = recentActivityRequest.data

    const categoriesRequest: AxiosResponse = await api.get(`/discussion/categories/lab/1`)
    const categories: CategoryType[] = categoriesRequest.data

    const posts: PostType[][] = await Promise.all(
      categories.map(async (category) => {
        try {
          const response: AxiosResponse = await api.get(`/discussion/category-posts/${ category.id }`)
          return response.data

        } catch (error) {
          console.error(`Failed to fetch posts for category ${ category.id }`, error)
          return []
        }
      })
    )

    return (
      <HomeClient user={ user } userPermission={ userPermission } recentActivity={ recentActivity } categories={ categories } posts={ posts }/>
    )
  }

export default DiscussionHome