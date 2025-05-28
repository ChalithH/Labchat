
export type ContactType = {
  // Mimic of schema
  id?: number
  userId: number
  type: string
  info: string
  useCase: string
  name: string
}

export type ProfileDataType = {
  // Mimic of schema
  id: number
  roleId: number
  universityId: string
  username: string
  loginEmail: string
  loginPassword: string
  firstName: string
  lastName: string
  displayName: string
  jobTitle: string
  office: string
  bio: string
  dateJoined: string
  lastViewed: string | null
  role: string
  profilePic?: string,
  lastViewedLabId?: string,
  contacts: ContactType[],

  // Custom field for frontend
  is_users_profile: boolean
} 