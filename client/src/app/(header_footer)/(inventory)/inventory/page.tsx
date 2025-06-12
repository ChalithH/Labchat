import getUserFromSessionServer from "@/lib/get_user_server"
import InventoryClient from "../components/InventoryClient"
import { redirect } from "next/navigation"
import setUsersLastViewed from "@/lib/set_last_viewed"
import { LabProvider } from "@/contexts/lab-context"
import api from "@/lib/api"
import { AxiosResponse } from "axios"

const Inventory: React.FC = async () => {
  await setUsersLastViewed(`/inventory`)
  const user = await getUserFromSessionServer()
  console.log('user', user); 
  if (!user) {
    redirect('/home')
  }

  // Ensure lastViewedLabId is a number, default to 1 if not present or invalid
  const lastViewedLabId = user.lastViewedLabId && !isNaN(parseInt(user.lastViewedLabId))
    ? parseInt(user.lastViewedLabId)
    : 1;

  if (!user.lastViewedLabId) {
    redirect('/admission');
  }

  const lab: AxiosResponse = await api.get(`/lab/${ user.lastViewedLabId }`)
  if (!lab) {
    redirect('/admission');
  }

  return (
    <LabProvider initialLabId={lastViewedLabId}>
      <InventoryClient user={user} />
    </LabProvider>
  )
}

export default Inventory
