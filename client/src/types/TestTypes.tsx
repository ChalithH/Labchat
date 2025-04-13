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
    job_title?: string,
    status: string,
    bio: string,
    contacts: UserContactType[]
}

export type UserContactType = {
    id: number,
    type: string,
    info: string,
    name: string,
    primary: boolean
}