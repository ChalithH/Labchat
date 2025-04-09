'use client'

import { useSearchParams } from 'next/navigation'
import React from 'react'

import Navigation from '../../components/Navigation'
import Title from '../../components/Title'
import Thread from '../../components/Thread'
import { TEST_DATA, TEST_DISCUSSION_LINKS } from '../../testdata';


const DiscussionThread = (): React.ReactNode => {
    const searchParams = useSearchParams()
    const topicQuery = { name: searchParams.get('name') }

    const matchingTopic = TEST_DATA.find(
		topic => topic.name.toLowerCase() === topicQuery.name?.toLowerCase()
	)
    return (
        <div className="m-auto w-[90dvw]">
            <Navigation breadcrumbs={ TEST_DISCUSSION_LINKS } />


            <Title bCategories={ true } bViewAll={ false } permToAdd='*' topic={ topicQuery.name || ''}/>

            { matchingTopic?.threads.map( (thread, idx) => (
				<Thread key={ idx } thread={ thread } bShowBlurb={ true }/>
			))}
        </div>
    )
}

export default DiscussionThread