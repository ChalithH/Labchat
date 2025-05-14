'use client'

import { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'



export const AddTagDialog = () => {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateTag = async () => {
    setIsLoading(true)
    //const response: AxiosResponse = 

    //if (response.status === 200) {
     // setTitle('')
      //setContent('')
     // setOpen(false)
      
     // router.refresh()
  //  } else {
   //   console.error('Failed to create tag')
  //  }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <img src="/add_to_topic_button.svg" alt="Add Tag" />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Tag</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Tag"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button onClick={handleCreateTag} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Tag'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
