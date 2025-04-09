import { TopicType, ThreadType, UserType } from './types/TestTypes'

export const USER_DATA: UserType = {
    name: 'Cole Howard',
    title: 'Lab Manager'
}

export const FIRST_THREAD_DATA: ThreadType = {
    tags: 2, 
    title: 'Very Important and Long Announcement Title',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ornare velit sed vestibulum varius. Donec tincidunt sagittis massa eget rhoncus. Curabitur vel mauris et lectus aliquam mattis sed nec eros. Duis a quam ac nisl auctor aliquet. Sed eu pellentesque turpis. Donec a lacinia ex. Aenean auctor dui et suscipit facilisis. Duis non lectus id elit hendrerit vestibulum et nec mauris. Maecenas auctor, nulla nec sollicitudin euismod, massa sapien tristique diam, non pharetra erat erat eu urna. Pellentesque convallis mauris nec gravida luctus.',
    author: USER_DATA,
    post_date: new Date().toLocaleDateString(),
    last_activity: new Date().toLocaleDateString()
}

export const SECOND_THREAD_DATA: ThreadType = {
    tags: 1, 
    title: 'Thread about missing or broken equipment',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ornare velit sed vestibulum varius. Donec tincidunt sagittis massa eget rhoncus. Curabitur vel mauris et lectus aliquam mattis sed nec eros. Duis a quam ac nisl auctor aliquet. Sed eu pellentesque turpis. Donec a lacinia ex. Aenean auctor dui et suscipit facilisis. Duis non lectus id elit hendrerit vestibulum et nec mauris. Maecenas auctor, nulla nec sollicitudin euismod, massa sapien tristique diam, non pharetra erat erat eu urna. Pellentesque convallis mauris nec gravida luctus.',
    author: USER_DATA,
    post_date: new Date().toLocaleDateString(),
    last_activity: new Date().toLocaleDateString()
}

export const TEST_DATA: TopicType[] = 
    [{ 
        name: 'Announcements', 
        threads: [FIRST_THREAD_DATA, FIRST_THREAD_DATA, FIRST_THREAD_DATA,
            FIRST_THREAD_DATA, FIRST_THREAD_DATA, FIRST_THREAD_DATA,
            FIRST_THREAD_DATA, FIRST_THREAD_DATA, FIRST_THREAD_DATA,
            FIRST_THREAD_DATA, FIRST_THREAD_DATA, FIRST_THREAD_DATA
        ]

        },{

        name: 'Missing or Broken', 
        threads: [SECOND_THREAD_DATA, SECOND_THREAD_DATA, SECOND_THREAD_DATA,
            SECOND_THREAD_DATA, SECOND_THREAD_DATA, SECOND_THREAD_DATA,
            SECOND_THREAD_DATA, SECOND_THREAD_DATA
        ]
    }];

    // Query injection just to get it running for client meeting
export const TEST_DISCUSSION_LINKS = [
    { name: "Home", href: "/discussion/home" },
    { name: "Announcements", href: "/discussion/thread?name=Announcements" }]