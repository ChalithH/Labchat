import getUserFromSessionServer from "@/lib/get_user_server"
import DashboardClient from "../../components/clients/DashboardClient"
import { redirect } from "next/navigation"
import { cookies } from 'next/headers'
import setUsersLastViewed from "@/lib/set_last_viewed"
import ResolveRoleName from '@/lib/resolve_role_name.util'

const Dashboard: React.FC = async () => {
    setUsersLastViewed(`/admin/dashboard`)
    const user = await getUserFromSessionServer()

    if (!user) {
        redirect('/home')
        return
    }

    // Check admin permission using the new endpoint
    const cookieStore = await cookies()
    const cookieHeaderString = cookieStore.toString()

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiBaseUrl) {
        console.error("CRITICAL: NEXT_PUBLIC_API_URL is not set. Cannot perform authorization check.")
        redirect('/home')
        return
    }

    let hasAdminPermission = false

    try {
        const response = await fetch(`${apiBaseUrl}/auth/check-admin-permission`, {
            headers: {
                ...(cookieHeaderString ? { 'cookie': cookieHeaderString } : {}),
            },
        })

        if (response.ok) {
            const data = await response.json()
            hasAdminPermission = data.hasAdminPermission
        } else {
            console.warn('Admin permission check failed:', response.status)
        }
    } catch (error) {
        console.error('Error checking admin permission:', error)
    }

    if (!hasAdminPermission) {
        redirect('/dashboard')
        return
    }

    const role: string = await ResolveRoleName(parseInt(user.roleId, 10))
    console.log(role, user.roleId)

    return <DashboardClient role={role}/>
}

export default Dashboard
