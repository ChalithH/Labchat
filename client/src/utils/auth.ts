import api from "./api"


export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const res = await api.get("/api/auth/status")
    
    return true
  } catch (err) {
    console.log("No current session!")
  }

  return false
}

export const getUserFromSession = async (): Promise<any | boolean> => {
  try {
    const res = await api.get("/api/auth/status")
    const data = res.data

    
  } catch (err) {
    console.log("No current session!")
  }

  return false
}