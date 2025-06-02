import React, { useState, useEffect } from 'react'

import Title from '../Title'
import Thread from '@/components/discussion/Thread'
import { PostType } from '@/types/post.type';
import { CategoryType } from '@/types/category.type';
import { useCurrentLabId } from '@/contexts/lab-context';
import api from '@/lib/api';
import getUserFromSession from '@/lib/get_user';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { UserType } from '@/types/User.type';


const TopicClient = async ({ params, user, userPermission, category, posts }:{ params: { id: string }, user: UserType, userPermission: number, category: CategoryType, posts: PostType[]}) => {
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
                <Title b_categories={ true } b_view_all={ false } user={ user } perm_to_add={ userPermission >= (category.postPermission ?? 0) ? true : false } category={ category }/>
            </div>

            { posts.map( (thread, idx, arr) => (
                <div key={ idx } className={ idx !== arr.length - 1 ? "mb-6" : "" }>
                    <Thread key={ idx } thread={ thread } b_show_blurb={ true }/>
                </div>
            ))}

            { posts.length === 0 && (
                <div className="text-gray-500 italic text-center py-8">
                    No posts found in this category for the current lab.
                </div>
            )}
        </main>
    )
}

export default TopicClient