import api from "@/lib/api";
import getUserFromSessionServer from "./get_user_server";

const setUsersLastViewedLab = async (labId: number) => {
  try {
    const user_response = await getUserFromSessionServer();
    if (!user_response) return;
    const new_user = { ...user_response, lastViewedLabId: labId }
    
    await api.put(`/user/update/${ new_user.id }`, new_user);
    return;
  } catch (err) {
    console.error("Failed to set last viewed lab:", err);
  }
};

export default setUsersLastViewedLab;
