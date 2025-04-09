import Link from 'next/link'
import React from 'react'
import { TopicType } from '../types/TestTypes'

type TitlePropTypes = {
    // Topic object
    topic: TopicType,

    // Permission required to view the add to topic button. Can ignore for now
    permToAdd: string,

    // Should there be a view all topics button
    bViewAll: boolean,

    // Should there be buttons for Recent / Popular categories
    bCategories: boolean
} 

const Title = ({ topic, permToAdd, bViewAll, bCategories } : TitlePropTypes) => {
    return (
        <div className="mt-12 barlow-font">
            <div className="flex justify-between items-center mb-1">
			<Link href={ `/discussion/topic/${ topic.id }` }>
                    <h1 className="play-font text-3xl font-bold ">{ topic.name[0].toUpperCase() + topic.name.slice(1, topic.name.length) }</h1>
                </Link>

                { permToAdd && <button><img src="/add_to_topic_button.svg" alt="" /></button> }
            </div>

            <div className="flex justify-between items-center text-lg mb-4">
                { bCategories && 
                    <div className="flex justify-between items-center gap-4 mt-2">
                        <button className="discussion-topic-filter-button">Recent</button>
                        <button className="">Popular</button>
                    </div> }

                { bViewAll && 
                    <Link href={ `topic/${ topic.id }`}>
                        <button className="discussion-topic-filter-button">View All</button>
                    </Link> }
            </div>
        </div>
    )
}

export default Title