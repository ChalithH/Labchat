import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { ProfileDataType } from '@/app/(header_footer)/(profile)/types/profile.types';

interface ProfilePictureProps {
  user_id: number,
  profilePic?: string | null, 
  name: string,
  size: number
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ user_id, profilePic, name, size }) => {
  if (profilePic === "") { 
    profilePic = null
  }
  return (
    <Avatar key={user_id} className={`size-${size} border-labchat-blue-500 border-2`}>
        <AvatarImage src={profilePic ?? undefined} alt={user_id.toString()} />
        <AvatarFallback className="bg-zinc-950 text-zinc-50">
          {`${name[0]}`}
        </AvatarFallback>
    </Avatar>
  )
}

export default ProfilePicture