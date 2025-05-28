import getUserFromSessionServer from "@/lib/get_user_server"
import DashboardClient from "../../components/clients/DashboardClient"
import { redirect } from "next/navigation"
import setUsersLastViewed from "@/lib/set_last_viewed"

const Dashboard: React.FC = async () => {
  setUsersLastViewed(`/admin/dashboard`)
  const user = await getUserFromSessionServer()

  if (!user) {
    redirect('/home')
  }

  return <DashboardClient />
}

export default Dashboard
