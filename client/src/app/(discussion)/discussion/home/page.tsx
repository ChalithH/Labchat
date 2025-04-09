import React from 'react'
import Thread from '../../components/Thread'
import Title from '../../components/Title'
import { TopicType, ThreadType, UserType } from '../../types/TestTypes'
import { Play } from 'lucide-react';

const USER_DATA: UserType = {
    name: 'Cole Howard',
    title: 'Lab Manager'
}

const FIRST_THREAD_DATA: ThreadType = {
    tags: 2, 
    title: 'Very Important and Long Announcement Title',
    author: USER_DATA,
    post_date: new Date().toLocaleDateString(),
    last_activity: new Date().toLocaleDateString()
}

const SECOND_THREAD_DATA: ThreadType = {
    tags: 1, 
    title: 'Thread about missing or broken equipment',
    author: USER_DATA,
    post_date: new Date().toLocaleDateString(),
    last_activity: new Date().toLocaleDateString()
}

const TEST_DATA: TopicType[] = 
    [{ 
        name: 'Announcements', 
        threads: [FIRST_THREAD_DATA, FIRST_THREAD_DATA, FIRST_THREAD_DATA]

        },{

        name: 'Missing or Broken', 
        threads: [SECOND_THREAD_DATA, SECOND_THREAD_DATA]
    }];



const Home = (): React.ReactNode => {
    return (
        <div className="m-auto w-[90dvw]">
            <section>
                <h1 className="play-font text-3xl font-bold pb-[24px]">Recent Activity</h1>

                <div className="flex gap-1 items-center justify-between m-auto">
                    <Play className="rotate-180" />
                    <Thread thread={ FIRST_THREAD_DATA } />
                    <Play />
                </div>
                

            </section>

            <section>
                { TEST_DATA.map( (topic, id) => (
                    <div key={ id }> 
                        <Title 
                        topic={ topic } 
                        permToAdd='*'
                        bViewAll={ true }
                        bCategories={ true } />

                        { topic.threads.map( (current_thread, idx) => 
                            <Thread key={ idx } thread={ current_thread }/>)
                        }
                    </div>
                )) }
            </section>
        </div>
    )
}

export default Home