import api from "@/lib/api";
import { MemberType } from "@/types/member.type";

/*
  getUserFromSession

  Use this function to obtain the current lab member from the session from
  a client side react component
*/

const getLabMember = async (userId: Number, labId: Number): Promise<MemberType | null> => {
  try {
    
    const member_response = await api.get(`member/get/user-lab/${userId}/${labId}`)
  
    return member_response.data

  } catch (err) {
    // Discard unauthorised error in console when user is not signed in
    console.error(err)
    return null;
  }
}

export default getLabMember