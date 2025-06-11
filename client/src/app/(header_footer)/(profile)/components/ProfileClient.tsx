
import { Separator } from '@/components/ui/separator'
import { ContactType, ProfileDataType } from '../types/profile.types'
import ContactGroup from './ContactGroup'
import EditProfile from './EditProfile'
import AddContact from './AddContact'
import ProfilePictureGroup from '@/components/profilePicture/ProfilePictureGroup'


export default function ProfileClient({ data, is_users_profile }: { data: ProfileDataType, is_users_profile: boolean }) {
  const contacts: ContactType[] = data.contacts 

  return (
    <main className="barlow-font w-[90dvw] m-auto mt-4">
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

      { is_users_profile &&  <section>
        <div className='flex justify-between'>
          <h1 className='text-3xl mb-1 font-semibold barlow-font'>Contact Details</h1>
          
            <AddContact />
          
        </div>

        { contacts.length > 0 ?
            <div className='mt-2 flex flex-col gap-4'>
              { contacts.map( contact =>
                <ContactGroup key={ contact.id } contact={ contact } is_users_profile={ is_users_profile } />
              ) }
            </div>
          :
            <p className='text-sm'>
              { data.firstName } has no contacts
            </p> }
      </section>
      }
    </main>
  )
}
