import api from "@/lib/api";

/*
  getUserFromSession

  Use this function to obtain the current user in session from
  a client side react component
*/

const getUserFromSession = async () => {
  try {
    const status_response = await fetch('http://localhost:8000/api/auth/status', {
      credentials: 'include'
    });

    // console.log(status_response)

    if (status_response.status !== 200) {
      return false
    }
    
    const user_response = await api.get(`/api/user/get/${ await status_response.json() }`)
  
    return user_response.data

  } catch (err) {
    // Discard unauthorised error in console when user is not signed in
  }
}

export default getUserFromSession