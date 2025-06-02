'use client'

import React, { useState, useEffect } from 'react'
import { useCurrentLabId } from '@/contexts/lab-context'
import api from '@/lib/api'
import { PostType } from '@/types/post.type'
import { DiscussionType } from '@/types/discussion.type'
import Thread from '@/components/discussion/Thread'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const BoardClient = ({ params }: { params: { id: string } }) => {
    const currentLabId = useCurrentLabId();
    const [discussion, setDiscussion] = useState<DiscussionType | null>(null);
    const [posts, setPosts] = useState<PostType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentLabId) return;

            setIsLoading(true);
            setError(null);

            try {
                // Fetch discussion info
                const discussionResponse = await api.get(`/discussion/lab/discussions?labId=${currentLabId}`);
                const discussions: DiscussionType[] = discussionResponse.data;
                const currentDiscussion = discussions.find(d => d.id === parseInt(params.id));
                
                if (!currentDiscussion) {
                    setError('Discussion not found or not accessible in current lab');
                    return;
                }
                
                setDiscussion(currentDiscussion);

                // Fetch posts for this discussion
                const postsResponse = await api.get(`/discussion/category-posts/${params.id}`);
                const postsData: PostType[] = postsResponse.data;
                setPosts(postsData);
            } catch (err) {
                console.error('Error fetching discussion board data:', err);
                setError('Failed to load discussion board data');
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
                    <div className="text-lg">Loading discussion board...</div>
                </div>
            </main>
        );
    }

    if (error || !discussion) {
        return (
            <main className="m-auto w-[90dvw]">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-red-500">Error: {error || 'Discussion board not found'}</div>
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
                        <BreadcrumbPage>{discussion.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="mb-8">
                <h1 className="play-font text-3xl font-bold mb-2">{discussion.name}</h1>
                {discussion.description && (
                    <p className="text-gray-600 mb-4">{discussion.description}</p>
                )}
                <div className="text-sm text-gray-500">
                    {posts.length} posts in this discussion
                </div>
            </div>

            <div className="space-y-6">
                {posts.map((post, idx) => (
                    <Thread key={post.id} thread={post} b_show_blurb={true} />
                ))}

                {posts.length === 0 && (
                    <div className="text-gray-500 italic text-center py-8">
                        No posts in this discussion yet. Be the first to start a conversation!
                    </div>
                )}
            </div>
        </main>
    )
}

export default BoardClient 