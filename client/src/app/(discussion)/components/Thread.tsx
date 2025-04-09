import React from 'react'

import { ThreadType } from '../types/TestTypes'
import ThreadAuthorGroup from './ThreadAuthorGroup'

const Thread = ({ thread }:{ thread : ThreadType }) => {
	return (
		<div className="discussion-thread barlow-font cursor-pointer mb-6">
      		<h1 className="text-lg">{ thread.title }</h1>

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