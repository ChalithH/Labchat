export type Reaction = {
  id: number
  postId: number
  memberId: number
  reactionId: number
  reaction: {
    id: number
    type: string
    emoji: string
  }
  member: {
    id: number
    user: {
      id: number
      username: string
    }
  }
}