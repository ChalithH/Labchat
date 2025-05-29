'use client'

import React, { useState, useEffect } from 'react'

import Title from '../Title'
import Thread from '@/components/discussion/Thread'
import { PostType } from '@/types/post.type';
import { CategoryType } from '@/types/category.type';
import { useCurrentLabId } from '@/contexts/lab-context';
import api from '@/lib/api';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const TopicClient = ({ params }: { params: { id: string } }) => {
    const currentLabId = useCurrentLabId();
    const [category, setCategory] = useState<CategoryType | null>(null);
    const [posts, setPosts] = useState<PostType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentLabId) return;

            setIsLoading(true);
            setError(null);

            try {
                // Fetch category info
                const categoryResponse = await api.get(`/discussion/tags/${params.id}`);
                const categoryData: CategoryType = categoryResponse.data;
                setCategory(categoryData);

                // Fetch posts for this tag filtered by lab
                const postsResponse = await api.get(`/discussion/lab/tags/${params.id}/posts?labId=${currentLabId}`);
                const postsData: PostType[] = postsResponse.data;
                setPosts(postsData);
            } catch (err) {
                console.error('Error fetching topic data:', err);
                setError('Failed to load topic data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [params.id, currentLabId]);

    if (isLoading) {
        return (
            <main className="m-auto w-[90dvw]">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Loading topic data...</div>
                </div>
            </main>
        );
    }

    if (error || !category) {
        return (
            <main className="m-auto w-[90dvw]">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-red-500">Error: {error || 'Category not found'}</div>
                </div>
            </main>
        );
    }

    return (
        <main className="m-auto w-[90dvw]">
            <Breadcrumb className='mb-4'>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/discussion/home">Discussion Home</BreadcrumbLink>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator />

                    <BreadcrumbItem>
                        <BreadcrumbPage>{ category.tag }</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="mb-8">
                <Title b_categories={ true } b_view_all={ false } perm_to_add='*' category={ category }/>
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