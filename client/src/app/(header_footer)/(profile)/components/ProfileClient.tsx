'use client'

import ThreadAuthorGroup from '@/components/discussion/ThreadAuthorGroup'
import api from '@/utils/api'

export default function ProfileClient({ userData }: { userData: any }) {
  const handleButtonClick = async () => {
    try {
      const response = await api.get('/api/auth/locked')
      alert(response.data.msg);

    } catch (err: any) {
      alert(`${ err.message} - ${ err.request.statusText }`);
    }
  }

  return (
    <main className="barlow-font w-[90dvw] m-auto mt-4">
      <button 
        onClick={ handleButtonClick }
        className="bg-orange-500 text-white p-4 rounded-2xl mb-4">
        Click to test a protected end point, requires 20 or higher permLevel
        Manually set your role in database to a roleId less than 6 to access 
      </button>

      <div className='bg-green-500 text-center text-sm text-white tracking-tight py-2 rounded-md mb-4'>
        <p>Currently { userData.status || '' }</p>
      </div>

      <div className='flex justify-center'>
        <ThreadAuthorGroup name={ `${ userData.firstName } ${ userData.lastName }` } role={ userData.roleId } job_title={ userData.jobTitle } size={ 64 } />
      </div>

      <div className='my-2 mb-6'>
        <h1 className='text-3xl font-semibold barlow-font'>Bio</h1>
        <p className='text-sm'>{ userData.bio }</p>
      </div>

      <section className='flex flex-col gap-2'>
        <h1 className='text-3xl font-semibold barlow-font'>Contacts</h1>

      </section>
    </main>
  )
}
