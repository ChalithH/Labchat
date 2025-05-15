import { UserType } from "./User.type"

enum DiscussionPostState {
  REPLIES_OPEN,      // Visible to all, open to replies
  REPLIES_CLOSED,    // Visible to all, replies closed

  HIDDEN,            // Visible to lab managers+, open to replies to those who can see
  STICKY             // Stuck to top of category
}

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
    state: DiscussionPostState
    member: {
        id: number
        userId: number
        user: UserType
    }
}
