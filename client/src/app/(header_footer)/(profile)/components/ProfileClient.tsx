import { Separator } from '@/components/ui/separator'
import { ContactType, ProfileDataType } from '../types/profile.types'
import ContactTable from './ContactTable'
import EditProfile from './EditProfile'
import ProfilePictureGroup from '@/components/profilePicture/ProfilePictureGroup'
import StatusTable from './StatusTable'

export default function ProfileClient({ 
  data, 
  is_users_profile 
}: { 
  data: ProfileDataType, 
  is_users_profile: boolean 
}) {
  const contacts: ContactType[] = data.contacts 
  const memberStatuses = data.memberStatuses || []
  const memberId = data.memberId

  return (
    <main className="w-[90dvw] m-auto my-6">
      <section className='flex flex-col justify-between'>
        <div className={ `flex items-center w-[100%] ${ is_users_profile ? 'justify-between' : 'justify-center' }` }>
          <ProfilePictureGroup 
            id={data.id} 
            profilePic={data.profilePic} 
            firstName={data.firstName}
            lastName={data.lastName}
            role={ data.role }
            size={14}
          />

          { is_users_profile && 
            <EditProfile /> }
        </div>

        <Separator className='my-6' />

        <div className="flex items-center gap-8">
          <div className="mb-2 ">
            <h3 className="barlow-font font-semibold text-sm">Display Name</h3>
            <p className="text-sm italic text-gray-600 font-medium tracking-tighter leading-[14px]">
              {data.displayName}
            </p>
          </div>

          <div className="mb-2">
            <h3 className="barlow-font font-semibold text-sm">Job Title</h3>
            <p className="text-sm italic text-gray-600 font-medium tracking-tighter leading-[14px]">
              {data.jobTitle}
            </p>
          </div>

          <div className="mb-2">
            <h3 className="barlow-font font-semibold text-sm">Preferred Location</h3>
            <p className="text-sm italic text-gray-600 font-medium tracking-tighter leading-[14px]">
              {data.office}
            </p>
          </div>

          <div className="mb-2">
            <h3 className="barlow-font font-semibold text-sm">UPI</h3>
            <p className="text-sm italic text-gray-600 font-medium tracking-tighter leading-[14px]">
              {data.universityId}
            </p>
          </div>
        </div>
      </section>

      <Separator className='my-6' />

      <div className='mb-6'>
        <h1 className='text-3xl mb-1 font-semibold barlow-font'>Bio</h1>
        <p className='text-sm'>{ data.bio || 'Write a short bio about your background, interests, current role or career and key skills.' }</p>
      </div>

      {/* Status Section - Show for all users, but only allow editing for lab managers/admins */}
      {(memberStatuses.length > 0 || is_users_profile) && memberId && (
        <>
          <Separator className='my-6' />
          <section className='mb-6'>
            <StatusTable 
              memberId={memberId}
              userId={data.id}
              initialStatuses={memberStatuses}
              canEdit={is_users_profile} // You can add more sophisticated permission logic here
            />
          </section>
        </>
      )}

      {/* Contact Details Section - Only show for the user's own profile */}
      {is_users_profile && (
        <>
          <Separator className='my-6' />
          <section>
            <ContactTable 
              contacts={contacts}
              is_users_profile={is_users_profile}
              firstName={data.firstName}
            />
          </section>
        </>
      )}
    </main>
  )
}