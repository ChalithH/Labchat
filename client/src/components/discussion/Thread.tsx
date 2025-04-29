'use client'

import React from 'react'
import Link from 'next/link'

import { FIRST_USER_DATA } from '@/app/testdata'

import { ThreadType } from '../../types/TestTypes'
import ThreadAuthorGroup from '@/components/discussion/ThreadAuthorGroup'

import { Breadcrumb, useBreadcrumb } from '../../app/(header_footer)/(discussion)/context/BreadcrumbContext';


const BLURB_CHAR_LIMIT: number = 128

const Thread = ({ thread, b_show_blurb }:{ thread : ThreadType, b_show_blurb : boolean }) => {
	const { breadcrumbs, setBreadcrumbs } = useBreadcrumb()

	const handleClick = (name: string, href: string) => {
		// If the last breadcrumb added is the same as new one do not add.
		// Easy fix to race condition problem I was having. Will check back to see
		// if this will work with final project.
		if (breadcrumbs && breadcrumbs[breadcrumbs.length - 1].href === href)
			return

		const newCrumb: Breadcrumb = {
			name: name,
			href: href
		}
		const newBreadcrumbs: Breadcrumb[] = [ ...(breadcrumbs ?? []), newCrumb ]
		setBreadcrumbs(newBreadcrumbs)
	}

	return (
		<div className="discussion-thread barlow-font cursor-pointer">
			<Link href={ `/discussion/thread/${ thread.id }` }>
				<h1 className="text-lg font-semibold leading-5"
					onClick={ () => 
						handleClick(thread.title, `/discussion/thread/${ thread.id }`) }>{ thread.title }</h1>
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