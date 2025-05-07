import React from 'react'

import Navigation from './Navigation'
import Title from './Title'
import Thread from '../../../../components/discussion/Thread'
import { TEST_DATA } from '@/app/testdata';


const TopicClient = async ({ params }:{ params: { id: string } }) => {
    const { id } = await params
    const topic_id = parseInt(id, 10)

    const matching_topic = TEST_DATA.find(topic => topic.id === topic_id)

    if (!matching_topic){
        return 'No topic found'
    }

    return (
        <main className="m-auto w-[90dvw]">
            <div className="mb-2">
                <Navigation />
            </div>

            <div className="mb-8">
                <Title b_categories={ true } b_view_all={ false } perm_to_add='*' topic={ matching_topic }/>
            </div>

            { matching_topic?.threads.map( (thread, idx, arr) => (
                <div key={ idx } className={ idx !== arr.length - 1 ? "mb-6" : "" }>
                    <Thread key={ idx } thread={ thread } b_show_blurb={ true }/>
                </div>
            ))}
        </main>
    )
}

export default TopicClient