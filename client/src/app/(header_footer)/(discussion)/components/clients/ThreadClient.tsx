'use client'

import ThreadAuthorGroup from '@/components/discussion/ThreadAuthorGroup'
import { Button } from '@/components/ui/button'
import { DiscussionPostState, PostType } from '@/types/post.type'
import { ReplyType } from '@/types/reply.type'
import { UserType } from '@/types/User.type'
import ResolveRoleName from '@/lib/resolve_role_name.util'
import { useEffect, useState } from 'react'
import EditPost from '../EditPost'
import { EyeOff, Trash } from 'lucide-react'
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import EditReply from '../EditReply'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { PermissionConfig } from '@/config/permissions'
import { MdPushPin } from 'react-icons/md'
import { Badge } from '@/components/ui/badge'

type ThreadClientProps = {
  post: PostType,
  category: string
  replies: ReplyType[],
  replyUsers: UserType[],
  author: any,
  authorRole: string,
  user: any,
  userRole: string,
  userPermission: number,
  member: any
}

const ThreadClient = ({ post, category, replies, replyUsers, author, authorRole, user, userRole, userPermission, member }: ThreadClientProps) => {
  const [response, setResponse] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [showDeletePostPopup, setShowDeletePostPopup] = useState<boolean>(false)
  const [showDeleteReplyPopup, setShowDeleteReplyPopup] = useState<boolean>(false)
  const [replyToDelete, setReplyToDelete] = useState<ReplyType | null>(null)
  const [resolvedRoles, setResolvedRoles] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchRoles = async () => {
      const roles = await Promise.all(replyUsers.map(user => ResolveRoleName(user.roleId)))
      setResolvedRoles(roles)
    }
    fetchRoles()
  }, [replyUsers])

  const handlePostReply = async () => {
    if (!response) {
      setError('Fill in the form before submitting')
      return
    }
    await api.post('/discussion/reply', { postId: post.id, memberId: member.id, content: response })
    setResponse('')
    router.refresh()
  }

  const confirmDeleteThread = () => setShowDeletePostPopup(true)

  const confirmDeleteReply = (reply: ReplyType) => {
    setReplyToDelete(reply)
    setShowDeleteReplyPopup(true)
  }

  const handleDeleteThread = async () => {
    await api.delete(`/discussion/post/${post.id}`)
    router.push('/discussion/home')
  }

  const handleDeleteReply = async () => {
    if (replyToDelete) {
      await api.delete(`/discussion/reply/${replyToDelete.id}`)
      setReplyToDelete(null)
      router.refresh()
    }
  }

  // True if,   Post has replies open    or    User has enough permission to override replies closd     or    User is the post owner    
  const showReplyBox: boolean = post.replyState === DiscussionPostState.REPLIES_OPEN || userPermission >= PermissionConfig.FORCE_COMMENT_PERMISSION || author.id === user.id

  return (
    <main className="m-auto w-[90dvw] barlow-font flex flex-col gap-3">
      <Breadcrumb className='mb-4'>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/discussion/home">Discussion Home</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink href={ `/discussion/topic/${ post.discussionId }` }>{ category }</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>{ post.title }</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      { post.tags && post.tags.length > 0 &&
        <div className="flex items-center gap-2">
          { post.tags.map(tag => 
          <Badge key={ tag.id } className="text-white" style={{ backgroundColor: tag.colour }}>
            {tag.tag}
          </Badge>) }
        </div>
        
      }

      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          { post.state === DiscussionPostState.STICKY && <MdPushPin className='text-yellow-500 font-semibold text-lg' /> }
          { post.state === DiscussionPostState.HIDDEN && <EyeOff className="w-4 h-4 text-muted-foreground" /> }
          <h1 className="text-3xl font-bold play-font">{post.title}</h1>
        </div>
        
        { author.id === (user as any).id &&
          <div className='flex space-x-4'>
            <EditPost post={ post } userPermission={ userPermission } />
            <Trash onClick={ confirmDeleteThread } className='w-5 h-5 text-muted-foreground cursor-pointer' />
          </div>}
      </div>

      <div className="flex justify-between items-center">
        <ThreadAuthorGroup role={authorRole} name={author.displayName} size={48} />

        <div>
          <div className="text-right text-sm">
            <p>Created {new Date(post.createdAt).toLocaleString('en-GB')}</p>
            <p>Last Activity {new Date(post.updatedAt).toLocaleString('en-GB')}</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-sm border border-gray-200 shadow-sm">
        <p>{post.content}</p>
      </div>

      { post.replyState === DiscussionPostState.REPLIES_CLOSED && <p className=' barlow-font text-lg font-semibold my-4'>Post is closed for replies</p> }
        
      { showReplyBox && 
        <div className="pb-8 rounded-sm flex flex-col gap-4">
          {error && <p className='play-font text-sm text-red-600'>{error}</p>}
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className="bg-white border p-4 w-full rounded-xl"
            placeholder="Type a comment"
          />
          <div className="w-full flex justify-between items-center">
            <ThreadAuthorGroup role={userRole} name={user.displayName} size={42} />
            <Button onClick={handlePostReply} variant="outline">Post Reply</Button>
          </div>
        </div>
      }

      {replies.length > 0 && (
        <h1 className="play-font w-full m-auto text-3xl font-bold pb-2">Replies</h1>
      )}

      {replies.map((reply, index) => {
        const replyUser = replyUsers[index]
        const role = resolvedRoles[index] || 'Loading'

        return (
          <div key={reply.id} className="p-4 barlow-font bg-white border rounded-xl flex flex-col gap-4 mb-4">
            <div className="flex justify-between items-start">
              <ThreadAuthorGroup role={role} name={replyUser.displayName} size={42} />
              <div className='flex flex-col space-y-2 items-end'>
                {reply.memberId === member.id &&
                  <div className='flex space-x-4'>
                    <EditReply reply={reply} />
                    <Trash onClick={() => confirmDeleteReply(reply)} className='w-5 h-5 text-muted-foreground' />
                  </div>}
                <p className="text-sm">
                  Posted {new Date(reply.createdAt).toLocaleString('en-GB')}
                </p>
              </div>
            </div>
            <p>{reply.content}</p>
          </div>
        )
      })}

      <Dialog open={showDeletePostPopup} onOpenChange={setShowDeletePostPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>Are you sure you want to delete this post?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <DialogClose asChild><Button onClick={handleDeleteThread}>Delete Post</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteReplyPopup} onOpenChange={setShowDeleteReplyPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reply</DialogTitle>
            <DialogDescription>Are you sure you want to delete this reply?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <DialogClose asChild><Button onClick={handleDeleteReply}>Delete Reply</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default ThreadClient
