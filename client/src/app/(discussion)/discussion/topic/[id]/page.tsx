import React from 'react'

import Navigation from '../../../components/Navigation'
import Title from '../../../components/Title'
import Thread from '../../../components/Thread'
import { TEST_DATA, TEST_DISCUSSION_LINKS } from '../../../testdata';


const DiscussionTopic = ({ params }:{ params: { id: string } }): React.ReactNode => {
    const topicId = parseInt(params.id, 10);

    const matchingTopic = TEST_DATA.find(topic => topic.id === topicId)

    if (!matchingTopic){
        return 'Bruh'
    }

    return (
        <section className="m-auto w-[90dvw]">
            <Navigation breadcrumbs={ TEST_DISCUSSION_LINKS } />


            <Title bCategories={ true } bViewAll={ false } permToAdd='*' topic={ matchingTopic }/>

            { matchingTopic?.threads.map( (thread, idx) => (
                <Thread key={ idx } thread={ thread } bShowBlurb={ true }/>
            ))}
        </section>
    )
}

export default DiscussionTopic