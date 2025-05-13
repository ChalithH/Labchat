import api from "@/lib/api";
import getUserFromSessionServer from "./get_user_server";

const setUsersLastViewed = async (page: string) => {
  try {
    const user_response = await getUserFromSessionServer()
    if (!user_response) {
      return;
    }
    const new_user = { ...user_response, lastViewed: page }
    
    await api.put(`/user/update/${ new_user.id }`, new_user);
    return
  } catch (err) {
    console.error(err)
  }
}

export default setUsersLastViewed