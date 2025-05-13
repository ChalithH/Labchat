import React from 'react'

import Title from '../Title'
import Thread from '@/components/discussion/Thread'
import { PostType } from '@/types/post.type';
import { CategoryType } from '@/types/category.type';


const TopicClient = async ({ params, category, posts }:{ params: { id: string }, category: CategoryType, posts: PostType[]}) => {
    return (
        <main className="m-auto w-[90dvw]">
            <div className="mb-8">
                <Title b_categories={ true } b_view_all={ false } perm_to_add='*' category={ category }/>
            </div>

            { posts.map( (thread, idx, arr) => (
                <div key={ idx } className={ idx !== arr.length - 1 ? "mb-6" : "" }>
                    <Thread key={ idx } thread={ thread } b_show_blurb={ true }/>
                </div>
            ))}
        </main>
    )
}

export default TopicClient