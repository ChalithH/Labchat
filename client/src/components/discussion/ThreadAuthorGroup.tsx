import React from 'react'

import { Badge } from '../ui/badge'
import ProfilePicture from '../profilePicture/ProfilePicture'


type ThreadAuthorGroupTypes = {
  id: number,
  role: string,
  name: string,
  job_title?: string,
  profilePic: string,
  size: number
}

const ThreadAuthorGroup = ({ id, role, name, job_title, profilePic, size }: ThreadAuthorGroupTypes) => {
  return (
    <div className="flex justify-start gap-2 items-center">
      <ProfilePicture 
            user_id={id}
            profilePic={profilePic}
            name={name}
            size={size} 
        />

      <div className="flex flex-col items-start">
        <Badge>{ role }</Badge>

        <p className="text-sm font-medium tracking-tighter">{ name } </p>
        { job_title && <p className="text-sm italic text-gray-600 font-medium tracking-tighter leading-[14px]">{ job_title } </p> }
      </div>
    </div>
  )
}

export default ThreadAuthorGroup