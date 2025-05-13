'use client'

import { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

type AddPostDialogProps = {
  discussionId: number
  memberId: number
}

export const AddPostDialog = ({ discussionId, memberId }: AddPostDialogProps) => {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleCreatePost = async () => {
    setIsLoading(true)

    console.log(discussionId, memberId, title, content)
    const response: AxiosResponse = await api.post('/discussion/post', {discussionId,memberId,title,content})

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
