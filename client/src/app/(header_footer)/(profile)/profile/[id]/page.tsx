import { redirect } from 'next/navigation'

import ProfileClient from '../../components/ProfileClient'
import getUserFromSessionServer from '@/utils/getUserFromSessionServer'

export default async function ProfilePage({ params }:{ params: { id: number }}) {
  const { id } = await params
  
  // We want this information now since the result of it
  // depends on whether the content should be visible.

  // So we have to use a server side component wrapper
  // if needed to provide this value
  const user = await getUserFromSessionServer()

  const user_id: number = parseInt(user.id, 10)
  
  if (!user || user_id != id) {
    redirect('/home')
  }

  return (
    // Real profile page
    <ProfileClient userData={user} />
  )
}
