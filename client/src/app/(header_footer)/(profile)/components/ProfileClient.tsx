'use client'

import ThreadAuthorGroup from '@/components/discussion/ThreadAuthorGroup'
import api from '@/utils/api'
import { ContactType } from '../types/contact.type'
import ContactGroup from './ContactGroup'

export default function ProfileClient({ userData }: { userData: any }) {
  const handleButtonClick = async () => {
    try {
      const response = await api.get('/api/auth/locked')
      alert(response.data.msg);

    } catch (err: any) {
      alert(`${ err.message} - ${ err.request.statusText }`);
    }
  }

  const contacts: ContactType[] = userData.contacts 

  return (
    <main className="barlow-font w-[90dvw] m-auto mt-4">
      <button 
        onClick={ handleButtonClick }
        className="bg-orange-500 text-white p-4 rounded-2xl mb-4">
        Click to test a protected end point, requires 20 or higher permLevel
        Manually set your role in database to a roleId less than 6 to access 
      </button>

      <div className='bg-green-500 text-center text-sm text-white tracking-tight py-2 rounded-md mb-4'>
        <p>Status</p>
      </div>

      <div className='flex justify-center'>
        <ThreadAuthorGroup name={ `${ userData.firstName } ${ userData.lastName }` } role={ userData.role } job_title={ userData.jobTitle } size={ 64 } />
      </div>

      <div className='my-2 mb-6'>
        <h1 className='text-3xl font-semibold barlow-font'>Bio</h1>
        <p className='text-sm'>{ userData.bio || 'Nothing displayed' }</p>
      </div>

      <section>
        <h1 className='text-3xl font-semibold barlow-font'>Contacts</h1>

        {
          contacts.length > 0 ?
            <div className='mt-2 flex flex-col gap-4'>
              { contacts.map( contact =>
                <ContactGroup key={ contact.id } contact={ contact } />
              ) }
            </div>
          :
            <p className='text-sm'>
              { userData.firstName } has no contacts
            </p>
        }
        
      </section>
    </main>
  )
}
