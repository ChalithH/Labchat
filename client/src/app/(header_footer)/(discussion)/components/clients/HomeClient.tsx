import React from 'react'

import Title from '@/app/(header_footer)/(discussion)/components/Title'
import RecentActivity from '@/app/(header_footer)/(discussion)/components/RecentActivity'
import Link from 'next/link'
import Thread from '@/components/discussion/Thread'

import { UserType } from '@/types/User.type'
import { PostType } from '@/types/post.type'
import { CategoryType } from '@/types/category.type'

const THREADS_PER_TOPIC = 3


const HomeClient = ({ user, userPermission, recentActivity, categories, posts }:{ user: UserType, userPermission: number, recentActivity: PostType[], categories: CategoryType[], posts: PostType[][] }): React.ReactNode => {
	// Filter by categories that the user has permission to see 
	const filtered = categories
		.map((category, i) => ({ category, posts: posts[i] }))
		.filter(({ category }) => (category.visiblePermission ?? 1) <= userPermission)

  return (
  	<main>
      <section className='mb-8'>
        <h1 className="play-font w-[90dvw] m-auto text-3xl font-bold">Browse Recent Discussions</h1>
        <RecentActivity posts={ recentActivity }/>
      </section>

			<section className="w-[90dvw] m-auto">
				{ filtered.map( ({ category, posts }) => 
					<div key={ category.id } className="mb-12">
						<Title
							user={ user }
							category={ category }
							
							perm_to_add={ userPermission >= (category.postPermission ?? 0) ? true : false } 
							b_view_all={ true } 
							b_categories={ true } 
						/>

						<div className="mt-2 space-y-6">
							{posts.slice(0, THREADS_PER_TOPIC).map(post => (
								<Thread key={post.id} thread={post} b_show_blurb={true} />
							))}

							{posts.length === 0 && (
								<div className="text-gray-500 italic">No posts in this category yet.</div>
							)}
						</div>
					</div>
				)}
			</section>
		</main>
	)
}

export default HomeClient