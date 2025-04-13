import React from 'react'

import Navigation from '../../../components/Navigation'
import Title from '../../../components/Title'
import Thread from '../../../components/Thread'
import { TEST_DATA } from '@/app/testdata';


const DiscussionTopic = async ({ params }:{ params: { id: string } }) => {
    const { id } = await params
    const topic_id = parseInt(id, 10)

    const matching_topic = TEST_DATA.find(topic => topic.id === topic_id)

    if (!matching_topic){
        return 'Bruh'
    }

    return (
        <main className="m-auto w-[90dvw]">
            <div className="mb-2">
                <Navigation />
            </div>

            <Title b_categories={ true } b_view_all={ false } perm_to_add='*' topic={ matching_topic }/>

            { matching_topic?.threads.map( (thread, idx) => (
                <Thread key={ idx } thread={ thread } b_show_blurb={ true }/>
            ))}
        </main>
    )
}

export default DiscussionTopic