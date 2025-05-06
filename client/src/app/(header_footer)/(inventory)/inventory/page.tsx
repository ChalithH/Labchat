import getUserFromSessionServer from "@/lib/get_user_server"
import InventoryClient from "../components/InventoryClient"
import { redirect } from "next/navigation"

const Inventory: React.FC = async () => {
  const user = await getUserFromSessionServer()

  if (!user) {
    redirect('/home')
  }

  return <InventoryClient />
}

export default Inventory
