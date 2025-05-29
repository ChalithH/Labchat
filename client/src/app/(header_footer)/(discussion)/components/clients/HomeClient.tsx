'use client'

import React from 'react'

import Title from '@/app/(header_footer)/(discussion)/components/Title'
import RecentActivity from '@/app/(header_footer)/(discussion)/components/RecentActivity'
import DiscussionSearchFilter from '@/app/(header_footer)/(discussion)/components/DiscussionSearchFilter'
import Thread from '@/components/discussion/Thread'
import { useDiscussionData } from '../../hooks/use-discussion-data'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const THREADS_PER_DISCUSSION = 3

const HomeClient = (): React.ReactNode => {
	const { recentPosts, discussions, postsByDiscussion, categories, postsByCategory, isLoading, error } = useDiscussionData()

	if (isLoading) {
		return (
			<main className="w-[90dvw] m-auto">
				<div className="flex justify-center items-center h-64">
					<div className="text-lg">Loading discussion data...</div>
				</div>
			</main>
		)
	}

	if (error) {
		return (
			<main className="w-[90dvw] m-auto">
				<div className="flex justify-center items-center h-64">
					<div className="text-lg text-red-500">Error: {error}</div>
				</div>
			</main>
		)
	}

	return (
		<main>
			<section className='mb-8'>
				<h1 className="play-font w-[90dvw] m-auto text-3xl font-bold">Browse Recent Discussions</h1>
				<RecentActivity posts={recentPosts} />
			</section>

			{/* Discussion Boards Section */}
			<section className="w-[90dvw] m-auto mb-12">
				<h2 className="play-font text-2xl font-bold mb-6">Discussion Boards</h2>
				{discussions.map((discussion, index) => (
					<div key={discussion.id} className="mb-12">
						<div className="flex justify-between items-center mb-4">
							<Link href={`/discussion/board/${discussion.id}`}>
								<h3 className="play-font text-xl font-bold hover:text-blue-600 transition-colors">
									{discussion.name}
								</h3>
							</Link>
							<div className="text-sm text-gray-500">
								{discussion._count?.posts || 0} posts
							</div>
						</div>
						
						{discussion.description && (
							<p className="text-gray-600 mb-4">{discussion.description}</p>
						)}

						<div className="space-y-4">
							{postsByDiscussion[index]?.slice(0, THREADS_PER_DISCUSSION).map(post => (
								<Thread key={post.id} thread={post} b_show_blurb={true} />
							))}

							{(!postsByDiscussion[index] || postsByDiscussion[index].length === 0) && (
								<div className="text-gray-500 italic">No posts in this discussion yet.</div>
							)}

							{postsByDiscussion[index]?.length > THREADS_PER_DISCUSSION && (
								<Link href={`/discussion/board/${discussion.id}`}>
									<Button variant="outline" className="mt-2">
										View All Posts ({postsByDiscussion[index].length})
									</Button>
								</Link>
							)}
						</div>
					</div>
				))}

				{discussions.length === 0 && (
					<div className="text-gray-500 italic text-center py-8">
						No discussion boards found for this lab.
					</div>
				)}
			</section>

			{/* Tag-based Search and Filter Section */}
			<section className="w-[90dvw] m-auto">
				<h2 className="play-font text-2xl font-bold mb-6">Browse by Topics</h2>
				<DiscussionSearchFilter
					categories={categories}
					posts={postsByCategory}
					threadsPerCategory={3}
				/>
			</section>
		</main>
	)
}

export default HomeClient