import React from 'react'
import Admin from './AdminPage'
import LabManager from './LabManagerPage'
import getUserFromSessionServer from '@/lib/get_user_server'
import { redirect } from 'next/navigation'

const AdminPage = async () => {
    const user = 0 //await getUserFromSessionServer()
    
    if (user) {
        redirect('/home')
    }

    if (1 === 1 || user?.role === 'admin') {
        return (
            <>
                <Admin />
            </>
        )
    } 
    
    else if (user?.role === 'lab_manager') {
        return (
            <>
                <LabManager />
            </>
        )
    } 

   else {
    redirect('/dashboard')
   } 
}

export default AdminPage
