'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

import api from "@/lib/api"

import { Button } from "@/components/ui/button"
import getUserFromSession from "@/lib/get_user"

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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Pencil } from "lucide-react"
import { PostType } from "@/types/post.type"


const EditPost = ({ post }: { post: PostType }) => {
  const router = useRouter()

  const [title, setTitle] = useState<string>('')
  const [contents, setContents] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const confirmUpdate = async () => {
    const newPost = { ...post, title, content: contents }
    await api.put(`/discussion/post/${ post.id }`, newPost)
  
    setIsConfirmOpen(false)
    setIsEditOpen(false)
    setTitle('')
    setContents('')
    setError(null)
    router.refresh()
  }
  
  const handleEditPost = async () => {
    if (!title || !contents) {
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
