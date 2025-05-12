'use client'

import React from 'react'
import Link from 'next/link'

import { FIRST_USER_DATA } from '@/app/testdata'

import ThreadAuthorGroup from '@/components/discussion/ThreadAuthorGroup'
import { PostType } from '@/types/post.type'

const BLURB_CHAR_LIMIT: number = 128

const Thread = ({ thread, b_show_blurb }:{ thread : PostType, b_show_blurb : boolean }) => {
	return (
		<div className="discussion-thread barlow-font cursor-pointer mb-6">
			<Link href={ `/discussion/thread/${ thread.id }` }>
				<h1 className="text-lg font-semibold leading-5">
					{ thread.title }
				</h1>
			</Link>

			{ b_show_blurb && 
				<p className="my-2">{ thread.content.slice(0, BLURB_CHAR_LIMIT) }</p>
			}

			<div className="mt-4 flex justify-between ">
				<ThreadAuthorGroup role={ FIRST_USER_DATA.title } name={ FIRST_USER_DATA.name } size={ 42 } />

				{/* <div className="text-xs m-auto text-right">
					<p>Created { thread.post_date }</p>
					<p>Last Activity { thread.last_activity }</p>
				</div> */}
			</div>
    	</div>
  	)
}

export default Thread