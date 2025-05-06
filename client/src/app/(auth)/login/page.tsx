
import getUserFromSessionServer from "@/lib/get_user_server"
import LoginClient from "./components/LoginClient"
import { redirect } from "next/navigation"

const LoginPage = async () => {
  const user = await getUserFromSessionServer()

  if (user) {
    redirect('/home')
  }

  return <LoginClient />
}

export default LoginPage