import getUserFromSessionServer from "@/lib/get_user_server"
import DashboardClient from "../../components/clients/DashboardClient"
import { redirect } from "next/navigation"
import setUsersLastViewed from "@/lib/set_last_viewed"
import ResolveRoleName from "@/lib/resolve_role_name.util"

const Dashboard: React.FC = async () => {
  setUsersLastViewed(`/admin/manage-lab`)
  const user = await getUserFromSessionServer()

  if (!user) {
    redirect('/home')
    return;
  }

  const role_id: number = parseInt(user.roleId, 10);
  
  if (role_id > 4) { 
    redirect('/dashboard')
    return;
  }

  const role: string = await ResolveRoleName(role_id);

  return <DashboardClient role={role} />
}

export default Dashboard
