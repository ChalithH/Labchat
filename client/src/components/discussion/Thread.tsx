'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

import ThreadAuthorGroup from '@/components/discussion/ThreadAuthorGroup'
import { PostType } from '@/types/post.type'
import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import { UserType } from '@/types/User.type'
import ResolveRoleName from '@/lib/resolve_role_name.util'

const BLURB_CHAR_LIMIT = 128

const Thread = ({ thread, b_show_blurb }: { thread: PostType, b_show_blurb: boolean }) => {
	const [ author, setAuthor ] = useState<UserType | null>(null)
	const [ role, setRole ] = useState<string>('')

	useEffect(() => {
		const getUser = async () => {
			try {
				const response: AxiosResponse = await api.get(`/user/get/${ thread.memberId }`)
				setAuthor(response.data)
			} catch (err) {
				console.error('Failed to fetch author', err)
			}
		}
		getUser()
	}, [ thread.memberId ])

	useEffect(() => {
		const getRole = async () => {
			if (!author) return
			try {
				const roleName = await ResolveRoleName(author.roleId)
				setRole(roleName)
			} catch (err) {
				console.error('Failed to resolve role name', err)
			}
		}
		getRole()
	}, [ author ])

	return (
		<div className="discussion-thread barlow-font cursor-pointer mb-6">
			<Link href={ `/discussion/thread/${ thread.id }` }>
				<h1 className="text-lg font-semibold leading-5">{ thread.title }</h1>
			</Link>

			{ b_show_blurb && <p className="my-2">{ thread.content.slice(0, BLURB_CHAR_LIMIT) }</p> }

			<div className="mt-4 flex justify-between">
				{ author ? (
					<ThreadAuthorGroup role={ role } name={ author.displayName } size={ 42 } />
				) : (
					<div className="text-sm italic">Loading author...</div>
				)}

				<div className="text-[12px] mt-auto text-right">
					<p>Created { new Date(thread.createdAt).toISOString() }</p>
					<p>Last Activity { new Date(thread.updatedAt).toISOString() }</p>
				</div>
			</div>
		</div>
	)
}

export default Thread
