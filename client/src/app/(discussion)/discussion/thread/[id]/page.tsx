import React from 'react'
import { TEST_DATA, TEST_DISCUSSION_LINKS } from '../../../testdata'
import { ThreadType } from '../../../types/TestTypes'
import Navigation from '../../../components/Navigation'
import ThreadAuthorGroup from '../../../components/ThreadAuthorGroup'


const DiscussionThread = ({ params }:{ params: { id: string } }): React.ReactNode => {
    const threadId = parseInt(params.id, 10);

    const matchingThread = TEST_DATA.flatMap(topic => topic.threads)
        .find(thread => thread.id === threadId);
        
    return (
        <section className="m-auto w-[90dvw]">
            <Navigation breadcrumbs={ TEST_DISCUSSION_LINKS } />

            <h1>{ matchingThread ? matchingThread.title : "Not found" }</h1>

            <ThreadAuthorGroup role="Lab Manager" name="Mark McNaught" />

            <p>{ matchingThread?.content }</p>
        </section>
    )
}

export default DiscussionThread