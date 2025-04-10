import React from 'react'
import { TEST_DATA, USER_DATA } from '../../../testdata'
import Navigation from '../../../components/Navigation'
import ThreadAuthorGroup from '../../../components/ThreadAuthorGroup'


const DiscussionThread = ({ params }:{ params: { id: string } }): React.ReactNode => {
    const thread_id = parseInt(params.id, 10);

    const matching_thread = TEST_DATA.flatMap(topic => topic.threads)
        .find(thread => thread.id === thread_id);
        
    return (
        <section className="m-auto w-[90dvw]">
            <Navigation />

            <h1>{ matching_thread ? matching_thread.title : "Not found" }</h1>

            <ThreadAuthorGroup role={ USER_DATA.title } name={ USER_DATA.name } />

            <p>{ matching_thread?.content }</p>
        </section>
    )
}

export default DiscussionThread