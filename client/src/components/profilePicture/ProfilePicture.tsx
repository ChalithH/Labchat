import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { ProfileDataType } from '@/app/(header_footer)/(profile)/types/profile.types';

interface ProfilePictureProps {
  user_id: number,
  profilePic?: string, 
  universityId: string,
  firstName: string,
  lastName: string,
  size: number
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ user_id, profilePic, universityId, firstName, lastName, size }) => {
  return (
    <Avatar key={user_id} className={`size-${size}`}>
        <AvatarImage src={profilePic ?? undefined} alt={universityId} />
        <AvatarFallback className="bg-zinc-950 text-zinc-50">
          {`${firstName[0]}${lastName[0]}`}
        </AvatarFallback>
    </Avatar>
  )
}

export default ProfilePicture