import { cookies } from 'next/headers'

/*
  getUserFromSessionServer

  Use this function to obtain the current user in session from
  a server side react component
*/

const getUserFromSessionServer = async () => {
  try {
    const cookieStore = await cookies()
    const cookieHeader = cookieStore.toString()

    const status_response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/status`, {
      headers: {
        cookie: cookieHeader,
      },
    })

    if (status_response.status !== 200) return false

    const userId = await status_response.json()

    const user_response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/get/${userId}`, {
      headers: {
        cookie: cookieHeader,
      },
    })

    if (user_response.status !== 200) return false

    return await user_response.json()
    
  } catch (err) {
    console.error('Error in getUserFromSession:', err)
    return false
  }
}

export default getUserFromSessionServer
