export interface Status {
  status: {
    id: number
    statusName: string
    statusWeight: number
  }
  isActive: boolean
  contact: { 
    id: number
    info: string
    name: string
    type: string
    useCase: string
    }
}

export interface LabMember {
  id: number
  firstName: string
  lastName: string
  displayName: string
  jobTitle: string
  office: string | null
  bio: string
  memberID: number
  labID: number
  createdAt: string
  inductionDone: boolean
  status: Status[]
}

export interface SortedMembers {
  [key: string]: LabMember[]
}
