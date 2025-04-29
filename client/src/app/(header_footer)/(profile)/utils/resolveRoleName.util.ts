import api from "@/utils/api"
import { AxiosResponse } from "axios"

const ResolveRoleName = async (role_id: number): Promise<string> => {

    try {
        const response: AxiosResponse = await api.get(`/api/role/get/${ role_id }`) 
        const role_name: string = response.data.name
        
        return role_name ?? 'Unresolved'
            
    } catch (err) {
        console.error(err)
        return 'Unresolved'
    }

}

export default ResolveRoleName