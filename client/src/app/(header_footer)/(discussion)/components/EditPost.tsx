'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

import api from "@/lib/api"

import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Pencil } from "lucide-react"
import { DiscussionPostState, PostType } from "@/types/post.type"
import { PermissionConfig } from "@/config/permissions"

const HIDDEN_PERMISSION = PermissionConfig.HIDDEN_PERMISSION
const STICKY_PERMISSION = PermissionConfig.STICKY_PERMISSION


const EditPost = ({ post, userPermission }: { post: PostType, userPermission: number }) => {
  const router = useRouter()

  const [title, setTitle] = useState<string>(post.title)
  const [contents, setContents] = useState<string>(post.content)
  const [replyState, setReplyState] = useState<string>(DiscussionPostState.REPLIES_OPEN.toString())
  const [state, setState] = useState<string>(DiscussionPostState.DEFAULT.toString())

  const [error, setError] = useState<string | null>(null)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const confirmUpdate = async () => {
    const newPost = { ...post, title, content: contents, replyState, state}
    await api.put(`/discussion/post/${ post.id }`, newPost)
  
    setIsConfirmOpen(false)
    setIsEditOpen(false)
    setTitle('')
    setContents('')
    setError(null)
    router.refresh()
  }
  
  const handleEditPost = async () => {
    if (!title || !contents || !state || !replyState) {
      setError('Fill in the form before submitting')
      return
    }

    setIsConfirmOpen(true)
    router.refresh()
  }

  return (
    <>
      <Dialog open={ isEditOpen } onOpenChange={ setIsEditOpen }>
        <DialogTrigger asChild>
          <Pencil className="w-5 h-5 cursor-pointer text-muted-foreground" /> 
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>Make changes to and save this post here</DialogDescription>

            { error && <p className='play-font text-sm text-red-600 text-center'>{ error }</p>}
          </DialogHeader>

          <div>
            <Label htmlFor="title" className='mb-1'>Title</Label>
            <Input 
              id='title' 
              type="text" 
              className='text-sm' 
              placeholder="Enter a title for the post"
              value={ title }
              onChange={ e => setTitle(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="contents" className='mb-1'>Contents</Label>
            <Input 
              id='contents' 
              type="text" 
              className='text-sm' 
              placeholder="Enter the contents of the post"
              value={ contents }
              onChange={ e => setContents(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="replyState" className="mb-1">Allow Replies</Label>
            <Select value={ replyState.toString() } onValueChange={ setReplyState }>
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Select a reply state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REPLIES_OPEN">Replies Open</SelectItem>
                <SelectItem value="REPLIES_CLOSED">Replies Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          { userPermission >= Math.max(HIDDEN_PERMISSION, STICKY_PERMISSION) &&
            <>
            <Label htmlFor="state" className="mb-[-8px]">State</Label>
              <Select value={ state.toString() } onValueChange={ setState }>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ DiscussionPostState.DEFAULT.toString() }>Default</SelectItem>
                  { userPermission >= HIDDEN_PERMISSION && <SelectItem value={ DiscussionPostState.HIDDEN.toString() }>Hidden</SelectItem> }
                  { userPermission >= STICKY_PERMISSION && <SelectItem value={ DiscussionPostState.STICKY.toString() }>Sticky</SelectItem> }
                </SelectContent>
              </Select>
            </>
          }

          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={ () => setError('') } variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={ handleEditPost }>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={ isConfirmOpen } onOpenChange={ setIsConfirmOpen }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Update</DialogTitle>
            <DialogDescription>
              Are you sure you want to save these changes?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={ confirmUpdate }>Confirm Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default EditPost
