import api from "@/utils/api";
import getUserFromSessionServer from "./getUserFromSessionServer";

const setUsersLastViewed = async (page: string) => {
  try {
    const user_response = await getUserFromSessionServer()
    const new_user = { ...user_response, lastViewed: page }
    
    await api.put(`/api/user/update/${ new_user.id }`, new_user);
    return
  } catch (err) {
    // Discard unauthorised error in console when user is not signed in
  }
}

export default setUsersLastViewed