'use client'
import React, { useState } from 'react'
import Title from '../Title'
import Thread from '@/components/discussion/Thread'
import { PostType } from '@/types/post.type';
import { CategoryType } from '@/types/category.type';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { UserType } from '@/types/User.type';


const TopicClient = ({ params, user, userPermission, category, posts }:{ params: { id: string }, user: UserType, userPermission: number, category: CategoryType, posts: PostType[]}) => {
    const [filter, setFilter] = useState<Record<number, 'recent' | 'popular'>>({})
    const getPosts = () => {
        const mode = filter[category.id] ?? 'recent'
        if (mode === 'popular') 
            return [...posts].sort((a, b) => b.reactions.length - a.reactions.length)
        return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    const filteredPosts = getPosts()
    console.log(filteredPosts)
    
    return (
        <main className="m-auto w-[90dvw]">
            <Breadcrumb className='mb-4'>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/discussion/home">Discussion Home</BreadcrumbLink>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator />

                    <BreadcrumbItem>
                        <BreadcrumbPage>{ category.name }</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="mb-8">
                <Title
                b_categories={true}
                b_view_all={false}
                user={user}
                perm_to_add={userPermission >= (category.postPermission ?? 0)}
                category={category}
                filter={filter[category.id] ?? 'recent'}
                setFilter={(mode) => {
                    setFilter(prev => ({ ...prev, [category.id]: mode }))
                }}/>
            </div>

            { filteredPosts.map( (thread, idx, arr) => (
                <div key={ idx } className={ idx !== arr.length - 1 ? "mb-6" : "" }>
                    <Thread key={ idx } thread={ thread } b_show_blurb={ true }/>
                </div>
            ))}

            { filteredPosts.length === 0 && (
                <div className="text-gray-500 italic text-center py-8">
                    No posts found in this category for the current lab.
                </div>
            )}
        </main>
    )
}

export default TopicClient