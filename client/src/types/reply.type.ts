import { UserType } from "./User.type"

export type ReplyType = {
    id: number,
    postId: number,
    memberId: number,
    content: string,
    createdAt: string,
    updatedAt: string,
    parentId?: number | null,
    children?: ReplyType[],
    member: {
            id: number
            userId: number
            user: UserType
    }
}