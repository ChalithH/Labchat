import { UserType } from "./User.type"

export type PostType = {
    id: number,
    discussionId: number,
    memberId: number,
    title: string,
    content: string,
    createdAt: string,
    updatedAt: string,
    isPinned: boolean,
    isAnnounce: boolean,
    member: {
        id: number
        userId: number
        user: UserType
    }
}