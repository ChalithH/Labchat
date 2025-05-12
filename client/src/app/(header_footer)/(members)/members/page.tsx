import React from 'react'
import MembersTable from '@/app/(header_footer)/(members)/components/members-table'
import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSessionServer from '@/lib/get_user_server'
import { redirect } from 'next/navigation'


const MembersPage = async () => {
    setUsersLastViewed(`/members`)

    const user = await getUserFromSessionServer()
    if (!user) { // make sure to change back to !user when auth is working
      redirect('/home')
    }
  
    return (
      <div className="container mx-auto px-4 py-6">
          <h1 className=" mt-3 flex justify-center items-center font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)]">
              Lab Members
          </h1>
          <MembersTable />
      </div>
    )
  }

export default MembersPage