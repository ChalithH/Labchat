import { TopicType, ThreadType, UserType, ReplyType } from '@/app/types/TestTypes'

export const USER_DATA: UserType = {
    id: 1,
    name: 'Cole Howard',
    title: 'Lab Manager'
}

export const FIRST_REPLY_DATA: ReplyType = {
    id: 1,
    author: USER_DATA,
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    post_Date: new Date().toLocaleDateString()
}

export const SECOND_REPLY_DATA: ReplyType = {
    id: 2,
    author: USER_DATA,
    content: 'Cras ornare velit sed vestibulum varius.',
    post_Date: new Date().toLocaleDateString()
}

export const THIRD_REPLY_DATA: ReplyType = {
    id: 3,
    author: USER_DATA,
    content: 'Donec tincidunt sagittis massa eget rhoncus.',
    post_Date: new Date().toLocaleDateString()
}


export const FIRST_THREAD_DATA: ThreadType = {
    id: 1,
    tags: 2, 
    title: 'Very Important and Long Announcement Title',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ornare velit sed vestibulum varius. Donec tincidunt sagittis massa eget rhoncus. Curabitur vel mauris et lectus aliquam mattis sed nec eros. Duis a quam ac nisl auctor aliquet. Sed eu pellentesque turpis. Donec a lacinia ex. Aenean auctor dui et suscipit facilisis. Duis non lectus id elit hendrerit vestibulum et nec mauris. Maecenas auctor, nulla nec sollicitudin euismod, massa sapien tristique diam, non pharetra erat erat eu urna. Pellentesque convallis mauris nec gravida luctus.',
    author: USER_DATA,
    post_date: new Date().toLocaleDateString(),
    last_activity: new Date().toLocaleDateString(),
    replies: [FIRST_REPLY_DATA, SECOND_REPLY_DATA, THIRD_REPLY_DATA]
}

export const SECOND_THREAD_DATA: ThreadType = {
    id: 2,
    tags: 1, 
    title: 'Thread about missing or broken equipment',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ornare velit sed vestibulum varius. Donec tincidunt sagittis massa eget rhoncus. Curabitur vel mauris et lectus aliquam mattis sed nec eros. Duis a quam ac nisl auctor aliquet. Sed eu pellentesque turpis. Donec a lacinia ex. Aenean auctor dui et suscipit facilisis. Duis non lectus id elit hendrerit vestibulum et nec mauris. Maecenas auctor, nulla nec sollicitudin euismod, massa sapien tristique diam, non pharetra erat erat eu urna. Pellentesque convallis mauris nec gravida luctus.',
    author: USER_DATA,
    post_date: new Date().toLocaleDateString(),
    last_activity: new Date().toLocaleDateString(),
    replies: [FIRST_REPLY_DATA, SECOND_REPLY_DATA, THIRD_REPLY_DATA]
}

export const TEST_DATA: TopicType[] = 
    [{ 
        id: 1,
        name: 'Announcements', 
        threads: [FIRST_THREAD_DATA, FIRST_THREAD_DATA, FIRST_THREAD_DATA,
            FIRST_THREAD_DATA, FIRST_THREAD_DATA, FIRST_THREAD_DATA,
            FIRST_THREAD_DATA, FIRST_THREAD_DATA, FIRST_THREAD_DATA,
            FIRST_THREAD_DATA, FIRST_THREAD_DATA, FIRST_THREAD_DATA
        ]

        },{
        
        id: 2,
        name: 'Missing or Broken', 
        threads: [SECOND_THREAD_DATA, SECOND_THREAD_DATA, SECOND_THREAD_DATA,
            SECOND_THREAD_DATA, SECOND_THREAD_DATA, SECOND_THREAD_DATA,
            SECOND_THREAD_DATA, SECOND_THREAD_DATA
        ]
    }];