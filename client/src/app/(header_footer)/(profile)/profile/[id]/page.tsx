import React from 'react'

import { FIRST_USER_DATA, SECOND_USER_DATA } from '@/app/testdata'
import ThreadAuthorGroup from '@/components/discussion/ThreadAuthorGroup'
import { UserType } from '@/types/TestTypes'
import ContactGroup from '../../components/ContactGroup'

const Profile = async ({ params }:{ params: { id: string } }) => {
  const { id } = await params
  const thread_id = parseInt(id, 10)
  
  const USER_DATA_MAP: Record<number, UserType> = {
    1: FIRST_USER_DATA,
    2: SECOND_USER_DATA,
  }

  const USER_DATA: UserType = USER_DATA_MAP[thread_id] ?? FIRST_USER_DATA

  return (
    <main className="barlow-font w-[90dvw] m-auto mt-4">
      <header>
        {/* Status section */}
        <div className='bg-green-500 text-center text-sm text-white tracking-tight py-2 rounded-md mb-4'>
          <p>Currently { USER_DATA.status }</p>
        </div>

        {/* User image, name and job title displayed */}
        <div className='flex justify-center'>
          <ThreadAuthorGroup name={ USER_DATA.name } role={ USER_DATA.title } job_title={ USER_DATA.job_title } size={ 64 }/>
        </div>

        {/* Bio div */}
        <div className='my-2 mb-6'>
          <h1 className='text-3xl font-semibold barlow-font'>Bio</h1>
          <p className='text-sm'>{ USER_DATA.bio }</p>
        </div>

        {/* Contact section */}
        <section className='flex flex-col gap-2'>
          <h1 className='text-3xl font-semibold barlow-font'>Contacts</h1>
          { USER_DATA.contacts
            .slice()
            .sort((a, b) => (b.primary ? 1 : 0) - (a.primary ? 1 : 0))
            .map(contact => (
              <ContactGroup key={contact.id} contact={contact} />))
          }
        </section>
      </header>

      <section>

      </section>
    </main>
  )
}

export default Profile