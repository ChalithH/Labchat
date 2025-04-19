import { redirect } from 'next/navigation'

import ProfileClient from '../../components/ProfileClient'
import getUserFromSessionServer from '@/utils/getUserFromSessionServer'
import api from '@/utils/api'
import setUsersLastViewed from '@/utils/setUsersLastViewed.utils'
import ResolveRoleName from '../../utils/resolveRoleName.util'

export default async function ProfilePage({ params }:{ params: { id: number }}) {
  const { id } = await params
  setUsersLastViewed(`/profile/${ id }`)


  // We want this information now since the result of it
  // depends on whether the content should be visible.

  // So we have to use a server side component wrapper
  // if needed to provide this value
  const user = await getUserFromSessionServer()

  const user_id: number = parseInt(user.id, 10)
  const role_id: number = parseInt(user.roleId, 10)
  
  if (!user || user_id != id && role_id != 1) {
    redirect('/home')
  }

  const userData = await api.get(`/api/user/get/${ id }`)

  // Add data requried for Profile page
  userData.data.role = await ResolveRoleName(role_id)
  
  const contact_response = await api.get(`/api/contact/get/${ id }`)
  userData.data.contacts = contact_response.data


  return (
    // Real profile page
    <ProfileClient userData={userData.data} />
  )
}
