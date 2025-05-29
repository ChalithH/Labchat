import React from 'react'

import { redirect } from 'next/navigation'

import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSessionServer from '@/lib/get_user_server'
import { LabProvider } from '@/contexts/lab-context'

import HomeClient from '../../components/clients/HomeClient'

const DiscussionHome = async () => {
    setUsersLastViewed(`/discussion/home`)

    const user = await getUserFromSessionServer()
    if (!user) {
      redirect('/home')
    }

    const currentLabId = user.lastViewedLabId || 1

    return (
      <LabProvider initialLabId={currentLabId}>
        <HomeClient />
      </LabProvider>
    )
  }

export default DiscussionHome