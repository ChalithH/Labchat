
export type TopicType = {
    name: string,
    threads: ThreadType[]
}

export type ThreadType = {
    tags: number,
    title: string,
    author: UserType,
    post_date: string,
    last_activity: string
}

export type UserType = {
    name: string,
    title: string,
}