import React from 'react'

import { redirect } from 'next/navigation'
import { AxiosResponse } from 'axios'

import { PostType } from '@/types/post.type'
import { CategoryType } from '@/types/category.type'

import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSessionServer from '@/lib/get_user_server' 

import { LabProvider } from '@/contexts/lab-context'
import HomeClient from '../../components/clients/HomeClient'
import api from '@/lib/api'
import { PermissionConfig } from '@/config/permissions'


const DiscussionHome = async () => {
    await setUsersLastViewed(`/discussion/home`)

    const user = await getUserFromSessionServer()
    if (!user) {
      redirect('/home')
    }


    const currentLabId = user.lastViewedLabId || 1

      

    const roleResponse: AxiosResponse = await api.get(`/role/get/${ user.roleId }`)
    const userPermission = roleResponse.data.permissionLevel

    const recentActivityRequest: AxiosResponse = await api.get(`/discussion/recent/${ currentLabId }`)
    const recentActivity: PostType[] = recentActivityRequest.data

    const filteredActivity = recentActivity.filter(post => {
      if (post.state !== 'HIDDEN' || post.member.userId === user.id) return true
      return userPermission >= PermissionConfig.HIDDEN_PERMISSION
    })

    const categoriesRequest: AxiosResponse = await api.get(`/discussion/categories/lab/${ currentLabId }`)
    const categories: CategoryType[] = categoriesRequest.data

    const posts: PostType[][] = await Promise.all(
      categories.map(async (category) => {
        try {
          const response: AxiosResponse = await api.get(`/discussion/category-posts/${ currentLabId }/${ category.id }`)
          const rawPosts: PostType[] = response.data

          const filteredPosts = rawPosts.filter(post => {
            if (post.state !== 'HIDDEN' || post.member.userId === user.id) return true
            return userPermission >= PermissionConfig.HIDDEN_PERMISSION
          })

          return filteredPosts

        } catch (error) {
          console.error(`Failed to fetch posts for category ${ category.id }`, error)
          return []
        }
      })
    )

    return (
      <LabProvider initialLabId={currentLabId}>
        <HomeClient user={ user } userPermission={ userPermission } recentActivity={ filteredActivity } categories={ categories } posts={ posts }/>
      </LabProvider>
    )
  }

export default DiscussionHome