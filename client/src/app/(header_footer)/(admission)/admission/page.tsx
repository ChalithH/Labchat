import React from 'react'
import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSessionServer from '@/lib/get_user_server'
import { redirect } from 'next/navigation'
import RequestAdmissionClient from '../components/request-admission-client'
import { UserType } from '@/types/account_user.type'


const AdmissionPage = async () => {
  setUsersLastViewed(`/admission`)

  const user: UserType = await getUserFromSessionServer()
  if (!user) {
    redirect('/home')
  }

  return (
      <RequestAdmissionClient userId={user.id} />
  )
}

export default AdmissionPage
