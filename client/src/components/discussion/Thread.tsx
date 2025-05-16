'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

import { MdPushPin } from "react-icons/md";
import ThreadAuthorGroup from '@/components/discussion/ThreadAuthorGroup'
import { DiscussionPostState, PostType } from '@/types/post.type'
import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import ResolveRoleName from '@/lib/resolve_role_name.util'
import getUserFromSession from '@/lib/get_user'
import { Loader2, Pencil, Trash } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import EditPost from '@/app/(header_footer)/(discussion)/components/EditPost'


const BLURB_CHAR_LIMIT = 128

const Thread = ({ thread, b_show_blurb }: { thread: PostType, b_show_blurb: boolean }) => {
	const [ author, setAuthor ] = useState<any>(null)
  const [ user, setUser ] = useState<any>()
	const [ role, setRole ] = useState<any>()
  const [showPopup, setShowPopup] = useState<boolean>(false)
  const router = useRouter()

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
				const response: AxiosResponse = await api.get(`/role/get/${ author.roleId }`) 
        const role_obj = response.data				
        setRole(role_obj)

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

  const handleDeletePopup = () => {
    setShowPopup(!showPopup)
  }
  
  const handleDeleteThread = async () => {
    const response: AxiosResponse = await api.delete(`/discussion/post/${ thread.id }`)
    router.refresh()
  }

  if (!author || !user || !role) {
    return ( 
      <div className="flex justify-center items-center gap-2 text-center p-4 border-1 play-font uppercase font-semibold text-xs border-gray-200 rounded-sm ">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Loading content...</p>
      </div>
  )}

	return (
		<div className="discussion-thread relative barlow-font cursor-pointer">
			<Link href={ `/discussion/thread/${ thread.id }` }>
      <div className='flex items-center gap-1'>
        { thread.state === DiscussionPostState.STICKY && <MdPushPin className='text-yellow-500 font-semibold text-lg' /> }
				<h1 className="text-lg font-semibold leading-5">{ thread.title }</h1>

        <p className='text-xs ml-4'>{ thread.state } | { thread.replyState }</p>
      </div>
			</Link>

			{ b_show_blurb && <p className="my-2">{ thread.content.slice(0, BLURB_CHAR_LIMIT) }</p> }

			<div className="mt-4 flex flex-col max-[400px]:flex-col sm:flex-row justify-between">
				{ author ? (
					<ThreadAuthorGroup role={ role.name } name={ author.displayName } size={ 42 } />
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
            <EditPost post={ thread } userPermission={ role.permissionLevel} />
            <Trash onClick={ handleDeletePopup } className='w-5 h-5 text-muted-foreground' />
          </div> }
			</div>

      <Dialog open={ showPopup } onOpenChange={ setShowPopup }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={ handleDeleteThread }>Delete Post</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
		</div>
	)
}

export default Thread