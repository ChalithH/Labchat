'use client'

import { useRouter } from 'next/navigation'
import React from 'react'

type TitlePropTypes = {
    // Topic name
    topic: string,

    // Permission required to view the add to topic button. Can ignore for now
    permToAdd: string,

    // Should there be a view all topics button
    bViewAll: boolean,

    // Should there be buttons for Recent / Popular categories
    bCategories: boolean
} 

const Title = ({ topic, permToAdd, bViewAll, bCategories } : TitlePropTypes) => {
    const router = useRouter()

    const handleClick = () => { 
        const topicData = {
            name: topic,
        }
        const query = new URLSearchParams(topicData).toString()
        router.push(`/discussion/thread?${query}`)
    }

    return (
        <div className="mt-12 barlow-font">
            <div className="flex justify-between items-center mb-1">
                <h1 onClick={ handleClick }className="heading text-3xl font-bold ">{ topic }</h1>
                { permToAdd && <button><img src="/add_to_topic_button.svg" alt="" /></button> }
            </div>

            <div className="flex justify-between items-center text-lg mb-4">
                { bCategories && 
                    <div className="flex justify-between items-center gap-4 mt-2">
                        <button className="discussion-topic-filter-button">Recent</button>
                        <button className="">Popular</button>
                    </div>
                }

                { bViewAll && <button onClick={ handleClick } className="discussion-topic-filter-button">View All</button> }
            </div>
        </div>
    )
}

export default Title