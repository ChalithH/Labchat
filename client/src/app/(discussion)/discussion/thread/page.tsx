'use client'

import { useSearchParams } from 'next/navigation'
import React from 'react'
import { TEST_DATA, TEST_DISCUSSION_LINKS } from '../../testdata'
import { ThreadType } from '../../types/TestTypes'
import Navigation from '../../components/Navigation'
import ThreadAuthorGroup from '../../components/ThreadAuthorGroup'


const DiscussionThread = (): React.ReactNode => {
    const searchParams = useSearchParams()
        const topicQuery = { name: searchParams.get('name') }
    
        const matchingThread = TEST_DATA.map(topic => topic.threads.find(thread => 
            thread.title.toLowerCase() === topicQuery.name?.toLowerCase()
        )).find((thread): thread is ThreadType => thread !== undefined)
        
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