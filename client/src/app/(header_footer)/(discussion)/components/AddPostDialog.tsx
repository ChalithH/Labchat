'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import { DiscussionPostState } from '@/types/post.type'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import getUserFromSession from '@/lib/get_user'
import ResolveRoleName from '@/lib/resolve_role_name.util'
import { PermissionConfig } from '@/config/permissions'

type AddPostDialogProps = {
  discussionId: number
  memberId: number
}

const HIDDEN_PERMISSION = PermissionConfig.HIDDEN_PERMISSION
const STICKY_PERMISSION = PermissionConfig.STICKY_PERMISSION

export const AddPostDialog = ({ discussionId, memberId }: AddPostDialogProps) => {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [replyState, setReplyState] = useState<string>(DiscussionPostState.REPLIES_OPEN.toString())
  const [state, setState] = useState<string>(DiscussionPostState.REPLIES_OPEN.toString())
  const [isLoading, setIsLoading] = useState(false)

  const [role, setRole] = useState<any>()

  useEffect( ()=>{
    const getUser = async () => {
      const user = await getUserFromSession()
      const getrole = await api.get(`/role/get/${ user.roleId }`)
      setRole(getrole.data)
    }
    getUser()
  },[] )

  const handleCreatePost = async () => {
    setIsLoading(true)
    const response: AxiosResponse = await api.post('/discussion/post', {discussionId,memberId,title,content,state,replyState})

    if (response.status === 200) {
      setTitle('')
      setContent('')
      setOpen(false)
      
      router.refresh()
    } else {
      console.error('Failed to create post')
    }

    setIsLoading(false)
  }

  if (!role) {
    return
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <img src="/add_to_topic_button.svg" alt="Add Post" />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Write your post here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <Label htmlFor="replyState" className="mb-1">Allow Replies</Label>
            <Select value={ replyState.toString() } onValueChange={ setReplyState }>
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ DiscussionPostState.REPLIES_OPEN.toString() }>Replies Open</SelectItem>
                <SelectItem value={ DiscussionPostState.REPLIES_CLOSED.toString() }>Replies Closed</SelectItem>
              </SelectContent>
            </Select>

          { (role.permissionLevel >= HIDDEN_PERMISSION || role.permissionLevel >= STICKY_PERMISSION) && (
          <>
            <Label htmlFor="state" className="mb-1">State</Label>
            <Select value={ state.toString() } onValueChange={ setState }>
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ DiscussionPostState.DEFAULT.toString() }>Default</SelectItem>

                { role.permissionLevel >= HIDDEN_PERMISSION && (
                  <SelectItem value={ DiscussionPostState.HIDDEN.toString() }>Hidden</SelectItem>
                )}
                { role.permissionLevel >= STICKY_PERMISSION && (
                  <SelectItem value={ DiscussionPostState.STICKY.toString() }>Sticky</SelectItem>
                )}
              </SelectContent>
            </Select>
          </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleCreatePost} disabled={isLoading}>
            {isLoading ? 'Posting...' : 'Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
