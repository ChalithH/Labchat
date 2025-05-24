import { redirect } from 'next/navigation'

import getUserFromSessionServer from '@/lib/get_user_server'
import setUsersLastViewed from '@/lib/set_last_viewed'

import PanelClient from './PanelClient'
import ResolveRoleName from '@/lib/resolve_role_name.util'

export default async function PanelPage() {
  setUsersLastViewed(`/admin`)

  const user = await getUserFromSessionServer()
  const role_id: number = parseInt(user.roleId, 10)
  
  if (!user && role_id > 4) {
    redirect('/home')
  }

  console.log(role_id)
  if (role_id > 4) {
    redirect('/dashboard')
  }

  const role: string = await ResolveRoleName(role_id)
  console.log(role)

  return (
    <PanelClient role={ role } roleId={ role_id } />
  )
}