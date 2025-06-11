import React from 'react'

import { Badge } from '../ui/badge'
import ProfilePicture from './ProfilePicture'


type ProfilePictureGroupTypes = {
  id: number,
  profilePic?: string, 
  firstName: string,
  lastName: string,
  size: number,
  job_title?: string,
  role: string
}

const ProfilePictureGroup = ({ id, profilePic, firstName, lastName,  size, role, job_title }: ProfilePictureGroupTypes) => {
  return (
    <div className="flex justify-start gap-2 items-center">
        <ProfilePicture 
            user_id={id}
            profilePic={profilePic}
            name={`${firstName} ${lastName}`}
            size={size} 
        />

      <div className="flex flex-col items-start">
        <Badge>{ role }</Badge>

        <p className="text-sm font-medium tracking-tighter">{ `${firstName} ${lastName}` } </p>
        { job_title && <p className="text-sm italic text-gray-600 font-medium tracking-tighter leading-[14px]">{ job_title } </p> }
      </div>
    </div>
  )
}


export default ProfilePictureGroup