'use client'

import { useState } from 'react'
import { ReplyType } from '@/types/reply.type'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

type EditReplyProps = {
  reply: ReplyType
}

const EditReply = ({ reply }: EditReplyProps) => {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(reply.content)
  const [error, setError] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const router = useRouter()

  const handleEditReply = () => {
    if (!content) {
      setError('Content cannot be empty')
      return
    }
    setIsConfirmOpen(true)
  }

  const confirmUpdate = async () => {
    await api.put(`/discussion/reply/${reply.id}`, { content })
    setIsConfirmOpen(false)
    setEditing(false)
    setContent('')
    setError(null)
    router.refresh()
  }

  return (
    <>
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogTrigger asChild>
          <Pencil className="w-5 h-5 text-muted-foreground cursor-pointer" />
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reply</DialogTitle>
            <DialogDescription>Edit your reply and save the changes.</DialogDescription>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </DialogHeader>

          <div>
            <Label htmlFor="content" className="mb-1">
              Reply Content
            </Label>
            <Input
              id="content"
              type="text"
              className="text-sm"
              placeholder="Enter your reply content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditReply}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
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
            <Button onClick={confirmUpdate}>Confirm Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default EditReply
