import React from 'react'

import { PostType } from '@/types/post.type'
import { CategoryType } from '@/types/category.type'

import Title from '@/app/(header_footer)/(discussion)/components/Title'
import RecentActivity from '@/app/(header_footer)/(discussion)/components/RecentActivity'
import Thread from '@/components/discussion/Thread'


const THREADS_PER_TOPIC = 3

const HomeClient = ({ recentActivity, categories, posts }:{ recentActivity: PostType[], categories: CategoryType[], posts: PostType[][] }): React.ReactNode => {
  return (
  	<main>
		<section>
        <h1 className="play-font w-[90dvw] m-auto text-3xl font-bold">Recent Activity</h1>
        <RecentActivity posts={ recentActivity }/>
      </section>

			<section className="w-[90dvw] m-auto">
				{ categories.map( (category, index) => (
					<div key={ category.id } className="mb-12">
						<Title 
							category={ category } 
							perm_to_add='*' 
							b_view_all={ true } 
							b_categories={ true } 
						/>

						<div className="pl-4 mt-2 space-y-4">
							{ posts[index].slice(0, THREADS_PER_TOPIC).map(post => 
								<Thread key={ post.id } thread={ post } b_show_blurb={ true }/>
							) }

							{ posts[index].length === 0 && <div className="text-gray-500 italic">No posts in this category yet.</div> }
						</div>
					</div>
				))}
			</section>
    </main>
  )
}

export default HomeClient