import React from 'react'
import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSessionServer from '@/lib/get_user_server'
import { redirect } from 'next/navigation'
import AdmissionClient from '../components/admission-client'
import RequestAdmissionClient from '../components/request-admission-client'
import { UserType } from '@/types/account_user.type'


type Params = Promise<{ view?: 'requests' | 'submit' }>


const AdmissionPage = async (props:{ params: Params}) => {
  setUsersLastViewed(`/admission`)

  const user: UserType = await getUserFromSessionServer()
  if (!user) {
    redirect('/home')
  }
  console.log(user)

  // Get the view from search params, default to 'requests' for admin view

  const params = await props.params
  const view = await params.view || 'requests';
  
  // You might want to get the current lab ID from user session or route params
  const labId = 20 // Replace with actual lab ID logic

  return (
    <div>
      {/* Navigation tabs or buttons could go here */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-4">
          <a 
            href="/admission?view=requests"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'requests' 
                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Manage Requests
          </a>
          <a 
            href="/admission?view=submit"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'submit' 
                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Submit Request
          </a>
        </div>
      </div>

      {/* Render the appropriate component based on view */}
      {view === 'submit' ? (
        <RequestAdmissionClient userId={user.id} />
      ) : (
        <AdmissionClient labId={labId} />
      )}
    </div>
  )
}

export default AdmissionPage