import React from 'react'

import Thread from '../../../../../components/discussion/Thread'
import Title from '../../components/Title'

import { FIRST_THREAD_DATA, TEST_DATA } from '@/app/testdata';


const THREADS_PER_TOPIC = 3

const DiscussionHome = (): React.ReactNode => {
    return (
        <main>
            <section>
                <h1 className="play-font w-[90dvw] m-auto text-3xl font-bold pb-[24px]">Recent Activity</h1>

                <div className="flex gap-1 items-center justify-between m-auto mb-6">
                    <img src='/play_arrow_filled.svg' alt='View previous latest post' className="mb-6 w-[52px]"/>
                    <Thread thread={ FIRST_THREAD_DATA } b_show_blurb={ false } />
                    <img src='/play_arrow_filled.svg' alt='View next latest post' className="rotate-180 mb-6 w-[52px]" />
                </div>
            </section>

            <section className="w-[90dvw] m-auto">
                { TEST_DATA.map( (topic, id) => (
                    <div 
                        key={ id }
                        className="mb-12"> 

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
        </main>
    )
}

export default DiscussionHome