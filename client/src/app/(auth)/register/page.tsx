import getUserFromSessionServer from "@/lib/get_user_server"
import RegisterClient from "./components/RegisterClient"
import { redirect } from "next/navigation"

const RegisterPage = async () => {
  const user = await getUserFromSessionServer()

  if (user) {
    redirect('/home')
  }

  return <RegisterClient />
}

export default RegisterPage