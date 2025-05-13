'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

import ThreadAuthorGroup from '@/components/discussion/ThreadAuthorGroup'
import { PostType } from '@/types/post.type'
import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import { UserType } from '@/types/User.type'
import ResolveRoleName from '@/lib/resolve_role_name.util'
import getUserFromSession from '@/lib/get_user'
import { Pencil, Trash } from 'lucide-react'


const BLURB_CHAR_LIMIT = 128

const Thread = ({ thread, b_show_blurb }: { thread: PostType, b_show_blurb: boolean }) => {
	const [ author, setAuthor ] = useState<any>(null)
  const [ user, setUser ] = useState<any>()
	const [ role, setRole ] = useState<string>('')

	useEffect(() => {
		const getUser = async () => {
			try {
				const response: AxiosResponse = await api.get(`/member/get/${ thread.memberId }`)
				const user: AxiosResponse = await api.get(`/user/get/${ response.data.userId }`)
				setAuthor(user.data)

			} catch (err) {
				console.error('Failed to fetch author', err)
			}
		}
		getUser()
	}, [thread.memberId])

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
	}, [author])

  useEffect(() => {
    const getUser = async () => {
      const user = await getUserFromSession()
      setUser(user)
    }
    getUser()
  }, [])

  if (!author || !user) {
    return ( 
    <div className="text-center p-4 border-1 play-font uppercase font-semibold text-xs border-gray-200 rounded-sm ">
      Loading content...
    </div>
    )
  }

	return (
		<div className="discussion-thread relative barlow-font cursor-pointer">
			<Link href={ `/discussion/thread/${ thread.id }` }>
				<h1 className="text-lg font-semibold leading-5">{ thread.title }</h1>
			</Link>

			{ b_show_blurb && <p className="my-2">{ thread.content.slice(0, BLURB_CHAR_LIMIT) }</p> }

			<div className="mt-4 flex flex-col max-[400px]:flex-col sm:flex-row justify-between">
				{ author ? (
					<ThreadAuthorGroup role={ role } name={ author.displayName } size={ 42 } />
				) : (
					<div className="text-sm italic">Loading author...</div>
				)}

				<div className="text-[12px] mt-2 sm:mt-auto sm:text-right max-[400px]:text-left">
					<p>Created { new Date(thread.createdAt).toLocaleString('en-GB', {
						day: '2-digit', month: 'short', year: 'numeric',
						hour: '2-digit', minute: '2-digit', hour12: true
					}) }</p>
					<p>Last Activity { new Date(thread.updatedAt).toLocaleString('en-GB', {
						day: '2-digit', month: 'short', year: 'numeric',
						hour: '2-digit', minute: '2-digit', hour12: true
					}) }</p>
				</div>


        { author.id === user.id && 
          <div className='flex space-x-4 absolute top-2 right-2'>
            <Pencil className="w-5 h-5 cursor-pointer text-muted-foreground" />
            <Trash className='w-5 h-5 text-muted-foreground' />
          </div> }
			</div>
		</div>
	)
}

export default Thread
