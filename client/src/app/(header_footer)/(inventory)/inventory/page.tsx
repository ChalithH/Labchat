import getUserFromSessionServer from "@/lib/get_user_server"
import InventoryClient from "../components/InventoryClient"
import { redirect } from "next/navigation"
import setUsersLastViewed from "@/lib/set_last_viewed"

const Inventory: React.FC = async () => {
  await setUsersLastViewed(`/inventory`)
  const user = await getUserFromSessionServer()
  console.log('user', user); 
  if (!user) {
    redirect('/home')
  }

  return <InventoryClient />
}

export default Inventory
