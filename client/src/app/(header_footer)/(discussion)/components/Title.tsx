'use client'

import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button';
import { AddPostDialog } from './AddPostDialog'
import { CategoryType } from '@/types/category.type';


type TitlePropTypes = {
    category: CategoryType,
    perm_to_add: string,
    b_view_all: boolean,
    b_categories: boolean
} 

const Title = ({ category, perm_to_add, b_view_all, b_categories } : TitlePropTypes) => {
    return (
        <div className="barlow-font">
            <div className="flex justify-between items-center mb-1">
                <Link href={ `/discussion/topic/${ category.id }` }>
                    <h1 className="play-font text-3xl font-bold">
                        { category.tag[0].toUpperCase() + category.tag.slice(1, category.tag.length) }</h1>
                </Link>

                { perm_to_add && <AddPostDialog discussionId={category.id} memberId={2} onPostCreated={() => ("")} /> }
            </div>

            <div className="flex justify-between items-center text-lg mb-4">
                { b_categories && 
                    <div className="flex justify-between items-center gap-4">
                        <Button variant="outline" className="h-8">Recent</Button>
                        <Button variant="outline" className="h-8">Popular</Button>
                    </div> }

                { b_view_all && 
                    <Link href={ `/discussion/topic/${ category.id }` }>
                        <Button className="h-8">View All</Button>
                    </Link> }
            </div>
        </div>
    )
}

export default Title