import React from 'react'
import setUsersLastViewed from '@/lib/set_last_viewed'
import getUserFromSessionServer from '@/lib/get_user_server'
import { redirect } from 'next/navigation'
import AdmissionClient from '../components/admission-client'
import RequestAdmissionClient from '../components/request-admission-client'
import { UserType } from '@/types/account_user.type'
import { cookies } from 'next/headers'

type SearchParams = Promise<{ view?: 'requests' | 'submit' }>

const AdmissionPage = async (props: { 
  params: Promise<{}>, 
  searchParams: SearchParams 
}) => {
  setUsersLastViewed(`/admission`)

  const user: UserType = await getUserFromSessionServer()
  if (!user) {
    redirect('/home')
  }

  const searchParams = await props.searchParams
  let view = searchParams.view || 'submit'

  // Check admin permission
  const cookieStore = cookies()
  const cookieHeaderString = cookieStore.toString()
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL

  let isAdmin = false
  if (apiBaseUrl) {
    try {
      const response = await fetch(`${apiBaseUrl}/auth/check-admin-permission`, {
        headers: {
          ...(cookieHeaderString ? { 'cookie': cookieHeaderString } : {}),
        },
      })
      if (response.ok) {
        const data = await response.json()
        isAdmin = data.hasAdminPermission
      }
    } catch (error) {
      console.error('Error checking admin permission:', error)
    }
  } else {
    console.error("CRITICAL: NEXT_PUBLIC_API_URL is not set.")
  }

  // Redirect non-admins trying to view "requests"
  if (view === 'requests' && !isAdmin) {
    redirect('/admission?view=submit')
  }

  const labId = Number(user.lastViewedLabId) || 1 

  return (
    <div>
      {/* Navigation tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-4">
          {isAdmin && (
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
          )}
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
      
      {/* Render the appropriate component */}
      {view === 'submit' ? (
        <RequestAdmissionClient userId={user.id} />
      ) : (
        <AdmissionClient labId={labId} />
      )}
    </div>
  )
}

export default AdmissionPage
