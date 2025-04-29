import React from 'react'

import Thread from '@/components/discussion/Thread'
import Title from '@/app/(header_footer)/(discussion)/components/Title'
import RecentActivity from '@/app/(header_footer)/(discussion)/components/RecentActivity';

import { TEST_DATA } from '@/app/testdata';


const THREADS_PER_TOPIC = 3

const HomeClient = (): React.ReactNode => {
    return (
        <main>
            <section>
                <h1 className="play-font w-[90dvw] m-auto text-3xl font-bold">Recent Activity</h1>

                <RecentActivity />
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

                        { topic.threads.slice(0, THREADS_PER_TOPIC).map( (current_thread, idx, arr) => (
                            <div key={ idx } className={ idx !== arr.length - 1 ? "mb-4" : "" }>
                                <Thread thread={ current_thread } b_show_blurb={ false } />
                            </div>
                        )) }
                    </div>
                )) }
            </section>
        </main>
    )
}

export default HomeClient