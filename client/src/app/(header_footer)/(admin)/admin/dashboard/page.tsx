import getUserFromSessionServer from "@/lib/get_user_server"
import DashboardClient from "../../components/clients/DashboardClient"
import { redirect } from "next/navigation"

import setUsersLastViewed from "@/lib/set_last_viewed"
import ResolveRoleName from '@/lib/resolve_role_name.util'

const Dashboard: React.FC = async () => {
    setUsersLastViewed(`/admin/dashboard`)
    const user = await getUserFromSessionServer()
    const role_id: number = parseInt(user.roleId, 10)

    if (!user) {
        redirect('/home')
    }
    
    if (role_id > 4) {
        redirect('/dashboard')
    }

    const role: string = await ResolveRoleName(role_id)
    console.log(role, role_id)

    return <DashboardClient role={role}/>
}

export default Dashboard
