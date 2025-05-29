import React from 'react'
import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSessionServer from '@/lib/get_user_server'
import { redirect } from 'next/navigation'
import MembersClient from '../components/MembersClient'
import { LabProvider } from '@/contexts/lab-context'

const MembersPage = async () => {
    setUsersLastViewed(`/members`)

    const user = await getUserFromSessionServer()
    if (!user) { // make sure to change back to !user when auth is working
      redirect('/home')
    }
  
    // Ensure lastViewedLabId is a number, default to 1 if not present or invalid
    const lastViewedLabId = user.lastViewedLabId && !isNaN(parseInt(user.lastViewedLabId))
      ? parseInt(user.lastViewedLabId)
      : 1;

    return (
      <LabProvider initialLabId={lastViewedLabId}>
        <MembersClient user={user} />
      </LabProvider>
    )
  }

export default MembersPage