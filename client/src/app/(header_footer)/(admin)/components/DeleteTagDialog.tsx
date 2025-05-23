'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

export const DeleteTagDialog = () => {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setTags(['Consumables', 'Chemicals', 'Fluids']) // add fetch for all tags
  }, [])

  const handleDeleteTag = async () => {
    if (!selectedTag) return

    setIsLoading(true)

    try {
      await api.delete(``) // add endpoint to delete tag
      setSelectedTag('')
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete tag', error)
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <img src="/minus_circle.svg" alt="Remove Tag" />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Tag</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={selectedTag} onValueChange={(value) => setSelectedTag(value)}>
            <SelectTrigger className="w-full">{selectedTag || 'Select a Tag'}</SelectTrigger>
            <SelectContent>
              {tags.map((tag) => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button onClick={handleDeleteTag} disabled={isLoading || !selectedTag}>
            {isLoading ? 'Deleting...' : 'Remove Tag'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
