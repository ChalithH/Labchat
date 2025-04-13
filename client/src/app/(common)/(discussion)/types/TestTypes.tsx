
export type ReplyType = {
    id: number,
    author: UserType,
    content: string,
    post_Date: string
}

export type TopicType = {
    id: number,
    name: string,
    threads: ThreadType[]
}

export type ThreadType = {
    id: number,
    tags: number,
    title: string,
    author: UserType,
    content: string,
    post_date: string,
    last_activity: string,
    replies: ReplyType[]
}

export type UserType = {
    id: number,
    name: string,
    title: string,
}