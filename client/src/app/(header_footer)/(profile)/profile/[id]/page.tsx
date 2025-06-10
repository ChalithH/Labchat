import { redirect } from 'next/navigation'
import { AxiosResponse } from 'axios'
import ProfileClient from '../../components/ProfileClient'
import { ProfileDataType } from '../../types/profile.types'
import getUserFromSessionServer from '@/lib/get_user_server'
import setUsersLastViewed from '@/lib/set_last_viewed'
import api from '@/lib/api'
import { LabProvider } from '@/contexts/lab-context'

type Params = Promise<{ id: number }>

export default async function ProfilePage(props:{ params: Params}) {
  const params = await props.params
  const id = params.id


  setUsersLastViewed(`/profile/${ id }`)

  /* We want this information now since the result of it
   depends on whether the content should be visible.

   So we have to use a server side component wrapper
   to provide this value immediately */
  const user = await getUserFromSessionServer()

  const user_id: number = parseInt(user.id, 10)
  
  // Check if user has permission to view this page
  if (!user) {
    redirect('/home')
  }

  // Ensure lastViewedLabId is a number, default to 1 if not present or invalid
    const lastViewedLabId = user.lastViewedLabId && !isNaN(parseInt(user.lastViewedLabId))
      ? parseInt(user.lastViewedLabId)
      : 1;

  const profile_data: AxiosResponse = await api.get(`/member/get/${ id }`)
  const user_data: AxiosResponse = await api.get(`/user/get/${ profile_data.data.userId }`)
  
  // Add data requried for Profile page
  const contact_response: AxiosResponse = await api.get(`/profile/get/${ profile_data.data.labId }/${ profile_data.data.userId }`)
  profile_data.data.contacts = contact_response.data
  
  profile_data.data.role = profile_data.data.labRole.name

  const data: ProfileDataType = {
    ...(profile_data.data as ProfileDataType),
    ...(user_data.data as Partial<ProfileDataType>)
  }
  const is_users_profile = user_id == profile_data.data.userId
  
  
  console.log('Profile data:', data)

  return (
    <LabProvider initialLabId={lastViewedLabId}>
     <ProfileClient data={ data } is_users_profile={ is_users_profile } />
    </LabProvider>
  )
}
