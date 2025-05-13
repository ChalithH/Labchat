'use client'

import ThreadAuthorGroup from '@/components/discussion/ThreadAuthorGroup'
import { Button } from '@/components/ui/button'
import { PostType } from '@/types/post.type'
import { ReplyType } from '@/types/reply.type'
import { UserType } from '@/types/User.type'
import ResolveRoleName from '@/lib/resolve_role_name.util'
import { useState } from 'react'
import EditPost from '../EditPost'
import { Trash } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import { redirect, useRouter } from 'next/navigation'


type ThreadClientProps = {
    post: PostType,
    replies: ReplyType[],
    replyUsers: UserType[],
    author: any,
    authorRole: string,
    user: any,
    userRole: string
}

const ThreadClient = ({ post, replies, replyUsers, author, authorRole, user, userRole }: ThreadClientProps) => {
    const [ response, setResponse ] = useState<string>('')
    const [ error, setError ] = useState<string | null>(null)
    const [showPopup, setShowPopup] = useState<boolean>(false)
    
    const handleDeletePopup = () => {
        setShowPopup(!showPopup)
    }

    const handlePostReply = () => {
        if (!response)
            setError('Fill in the form before submitting')
    }

    const handleDeleteThread = async () => {
        const response: AxiosResponse = await api.delete(`/discussion/post/${ post.id }`)
        redirect('/discussion/home')
    }
    

    return (
        <main className="m-auto w-[90dvw] barlow-font flex flex-col gap-3">
            <div className='flex justify-between items-center'>
                <h1 className="text-3xl font-bold play-font">{ post.title }</h1>
                { author.id === user.id && 
                <div className='flex space-x-4'>
                    <EditPost post={ post }/>
                    <Trash onClick={ handleDeletePopup } className='w-5 h-5 text-muted-foreground' />
                </div> }
            </div>

            <div className="flex justify-between items-center">
                <ThreadAuthorGroup role={ authorRole } name={ author.displayName } size={ 48 } />
                
                <div className="text-right text-sm">
                    <p>Created { new Date(post.createdAt).toLocaleString('en-GB', {
						day: '2-digit', month: 'short', year: 'numeric',
						hour: '2-digit', minute: '2-digit', hour12: true
					}) }</p>
					<p>Last Activity { new Date(post.updatedAt).toLocaleString('en-GB', {
						day: '2-digit', month: 'short', year: 'numeric',
						hour: '2-digit', minute: '2-digit', hour12: true
					}) }</p>
                </div>
            </div>

            <div className="p-4 rounded-sm border-1 border-gray-200 shadow-sm">
                <p>{ post.content }</p>
            </div>

            <div className="p-4 rounded-sm flex flex-col gap-4 my-8">
            { error && <p className='play-font text-sm text-red-600'>Fill in the form before submitting</p>}

                <textarea 
                    value={ response }
                    onChange={ (e) => setResponse(e.target.value)}
                    className="bg-white border-1 p-4 w-[100%] rounded-xl"
                    placeholder="Type a comment" />
                
                <div className="w-[100%] flex justify-between items-center">
                    <div>
                        <ThreadAuthorGroup role={ userRole } name={ user.displayName } size={ 42 } />
                    </div>

                    <Button onClick={ handlePostReply } variant="outline">Post Reply</Button>
                </div>
            </div>

            
            { replies.length > 0 && 
                <div className='flex justify-between pb-[24px]'>
                    <h1 className="play-font w-[90dvw] m-auto text-3xl font-bold">Replies</h1>
                    <img 
                        className="rotate-270"
                        src="/play_arrow_filled_black.svg" 
                        alt="Drop down button to see replies" />
                </div>
            }

            { replies.map(async (reply, index) => {
                const replyUser = replyUsers[index]

                return (
                <div key={ reply.id } className="p-4 barlow-font rounded-3xl bg-blue-50 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                    <ThreadAuthorGroup 
                        role={ await ResolveRoleName(replyUser.roleId) }
                        name={ replyUser.displayName } 
                        size={ 42 } 
                    />
                    <p className="text-sm">Posted { new Date(reply.createdAt).toLocaleString('en-GB', {
						day: '2-digit', month: 'short', year: 'numeric',
						hour: '2-digit', minute: '2-digit', hour12: true
					}) }</p>
                    </div>
                    <p>{ reply.content }</p>
                </div>
                )
            }) }

            
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
        </main>
    )
}

export default ThreadClient