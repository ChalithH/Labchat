import React from 'react'
import Thread from '../../components/Thread'
import Title from '../../components/Title'
import { Play } from 'lucide-react';
import { FIRST_THREAD_DATA, TEST_DATA } from '../../testdata';


const THREADS_PER_TOPIC = 3

const DiscussionHome = (): React.ReactNode => {
    return (
        <div className="m-auto w-[90dvw]">
            <section>
                <h1 className="play-font text-3xl font-bold pb-[24px]">Recent Activity</h1>

                <div className="flex gap-1 items-center justify-between m-auto">
                    <Play className="rotate-180" />
                    <Thread thread={ FIRST_THREAD_DATA } b_show_blurb={ false } />
                    <Play />
                </div>
            </section>

            <section>
                { TEST_DATA.map( (topic, id) => (
                    <div key={ id }> 
                        <Title 
                        topic={ topic } 
                        perm_to_add='*'
                        b_view_all={ true }
                        b_categories={ true } />

                        { topic.threads.slice(0, THREADS_PER_TOPIC).map( (current_thread, idx) => (
                            <Thread key={ idx } thread={ current_thread } b_show_blurb={ false }/>
                        )) }
                    </div>
                )) }
            </section>
        </div>
    )
}

export default DiscussionHome