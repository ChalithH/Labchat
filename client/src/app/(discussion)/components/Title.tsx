'use client'

import Link from 'next/link'
import React from 'react'

import { TopicType } from '../types/TestTypes'

import { Breadcrumb, useBreadcrumb } from '../context/BreadcrumbContext';


type TitlePropTypes = {
    // Topic object
    topic: TopicType,

    // Permission required to view the add to topic button. Can ignore for now
    perm_to_add: string,

    // Should there be a view all topics button
    b_view_all: boolean,

    // Should there be buttons for Recent / Popular categories
    b_categories: boolean
} 

const Title = ({ topic, perm_to_add, b_view_all, b_categories } : TitlePropTypes) => {
    const { breadcrumbs, setBreadcrumbs } = useBreadcrumb()

    const handleClick = (name: string, href: string) => {
        const newCrumb: Breadcrumb = {
            name: name,
            href: href
        }
        const newBreadcrumbs: Breadcrumb[] = [ ...(breadcrumbs ?? []), newCrumb ]
        setBreadcrumbs(newBreadcrumbs)
    }

    return (
        <div className="mt-12 barlow-font">
            <div className="flex justify-between items-center mb-1">
                <Link href={ `/discussion/topic/${ topic.id }` }>
                    <h1 className="play-font text-3xl font-bold"
                        onClick={ () => 
                            handleClick(topic.name, `/discussion/topic/${ topic.id }`) }>
                            
                        { topic.name[0].toUpperCase() + topic.name.slice(1, topic.name.length) }</h1>
                </Link>

                { perm_to_add && <button><img src="/add_to_topic_button.svg" alt="" /></button> }
            </div>

            <div className="flex justify-between items-center text-lg mb-4">
                { b_categories && 
                    <div className="flex justify-between items-center gap-4 mt-2">
                        <button className="discussion-topic-filter-button">Recent</button>
                        <button className="">Popular</button>
                    </div> }

                { b_view_all && 
                    <Link 
                        onClick={ () => 
                            handleClick(topic.name, `/discussion/topic/${ topic.id }`) } 
                        href={ `/discussion/topic/${ topic.id }` }>

                        <button className="discussion-topic-filter-button">View All</button>
                    </Link> }
            </div>
        </div>
    )
}

export default Title