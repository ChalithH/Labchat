import getUserFromSessionServer from "@/lib/get_user_server"
import CreateLabClient from "../../components/clients/CreateLabClient"
import { redirect } from "next/navigation"

import setUsersLastViewed from "@/lib/set_last_viewed"
import ResolveRoleName from '@/lib/resolve_role_name.util'

const CreateLab: React.FC = async () => {
    setUsersLastViewed(`/admin/create-lab`)
    const user = await getUserFromSessionServer()
    const role_id: number = parseInt(user.roleId, 10)

    if (!user) {
        redirect('/home')
    }

    if (role_id > 4 || role_id !== 1) {
        redirect(role_id > 4 ? '/dashboard' : '/admin/dashboard')
    }

    const role: string = await ResolveRoleName(role_id)
    console.log(role, role_id)

    return <>
    <CreateLabClient />
    </>
}

export default CreateLab
