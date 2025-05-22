'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { MdPushPin } from "react-icons/md";
import { EyeOff } from 'lucide-react'
import ThreadAuthorGroup from '@/components/discussion/ThreadAuthorGroup'
import { DiscussionPostState, PostType } from '@/types/post.type'
import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import getUserFromSession from '@/lib/get_user'
import { Loader2, Trash } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import EditPost from '@/app/(header_footer)/(discussion)/components/EditPost'
import { PermissionConfig } from '@/config/permissions';
import { Badge } from '../ui/badge';


const BLURB_CHAR_LIMIT = 128

const Thread = ({ thread, b_show_blurb }: { thread: PostType, b_show_blurb: boolean }) => {
	const [ author, setAuthor ] = useState<any>(null)
  const [ user, setUser ] = useState<any>()
	const [ authorRole, setAuthorRole ] = useState<any>()
	const [ userRole, setUserRole ] = useState<any>()
  const [showPopup, setShowPopup] = useState<boolean>(false)
  const router = useRouter()

	useEffect(() => {
		const getUser = async () => {
			try {
				const response: AxiosResponse = await api.get(`/member/get/${ thread.memberId }`)
				const author: AxiosResponse = await api.get(`/user/get/${ response.data.userId }`)
				setAuthor(author.data)

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
        setAuthorRole(role_obj)

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

      const userRoleResponse: AxiosResponse = await api.get(`/role/get/${ user.roleId }`) 
      setUserRole(userRoleResponse.data)
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

  const reactionSummary = thread.reactions?.reduce((acc: Record<string, number>, curr: any) => {
    const key = curr.reaction.reaction + ' ' + curr.reaction.reactionName
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  if (!author || !user || !authorRole || !userRole) {
    return ( 
      <div className="flex justify-center items-center gap-2 text-center p-4 border-1 play-font uppercase font-semibold text-xs border-gray-200 rounded-sm ">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Loading content...</p>
      </div>
  )}

	return (
		<div className="discussion-thread relative barlow-font cursor-pointer">
      { thread.tags && thread.tags.length > 0 &&
        <div className="flex flex-wrap gap-2 mb-2">
          { thread.tags.map(tag => 
            <Badge key={ tag.id } className="text-white" style={{ backgroundColor: tag.colour }}>
              {tag.tag}
            </Badge>
          )}
        </div>
      }

			<Link href={ `/discussion/thread/${ thread.id }` }>
      <div className='flex items-center gap-1'>
        { thread.state === DiscussionPostState.STICKY && <MdPushPin className='text-yellow-500 font-semibold text-lg' /> }
        { thread.state === DiscussionPostState.HIDDEN && <EyeOff className="w-4 h-4 text-muted-foreground" /> }
				<h1 className="text-lg font-semibold leading-5">{ thread.title }</h1>
      </div>
			</Link>

			{ b_show_blurb && <p className="my-2">{ thread.content.slice(0, BLURB_CHAR_LIMIT) }</p> }

			<div className="mt-4 flex flex-col max-[400px]:flex-col sm:flex-row justify-between">
				{ author ? (
					<ThreadAuthorGroup role={ authorRole.name } name={ author.displayName } size={ 42 } />
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

        { (author.id === user.id || userRole.permissionLevel >= PermissionConfig.MODIFY_ALL_POSTS) && 
          <div className='flex space-x-4 absolute top-2 right-2'>
            <EditPost post={ thread } userPermission={ userRole.permissionLevel} />
            <Trash onClick={ handleDeletePopup } className='w-5 h-5 text-muted-foreground' />
          </div> }
			</div>

      { reactionSummary && Object.entries(reactionSummary).length > 0 && 
        <div className="flex gap-2 mt-4 flex-wrap">
          {Object.entries(reactionSummary).map(([label, count]) => (
            <p key={label} className="play-font text-sm">{label} x {count}</p>
          ))}
        </div>
      }

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