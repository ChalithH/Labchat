
import React from 'react'
import Link from 'next/link'

import { ThreadType } from '../types/TestTypes'
import ThreadAuthorGroup from './ThreadAuthorGroup'

const BLURB_CHAR_LIMIT: number = 128

const Thread = ({ thread, bShowBlurb }:{ thread : ThreadType, bShowBlurb : boolean }) => {
	return (
		<div className="discussion-thread barlow-font cursor-pointer mb-6">
			<Link href={ `/discussion/thread/${ thread.id }` }>
				<h1 className="text-lg font-semibold leading-5">{ thread.title }</h1>
			</Link>

			{ bShowBlurb && 
				<p className="my-2">{ thread.content.slice(0, BLURB_CHAR_LIMIT) }</p>
			}

			<div className="mt-4 flex justify-between ">
				<ThreadAuthorGroup role="Lab Manager" name="Mark McNaught" />

				{/* <div className="text-xs m-auto text-right">
					<p>Created { thread.post_date }</p>
					<p>Last Activity { thread.last_activity }</p>
				</div> */}
			</div>
    	</div>
  	)
}

export default Thread