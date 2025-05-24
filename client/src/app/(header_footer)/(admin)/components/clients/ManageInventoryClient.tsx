"use client"

import { useState, useEffect } from "react"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
// import axios from "axios"

type Item = {
  id: number
  name: string
  description?: string
  safetyInfo?: string
  approval: boolean
}

const mockItems: Item[] = [
  { id: 1, name: "Gloves", description: "Latex gloves for lab safety", safetyInfo: "Keep away from heat", approval: true },
  { id: 2, name: "Safety Goggles", description: "Protects eyes from splashes", safetyInfo: "Clean regularly", approval: false },
  { id: 3, name: "Lab Coat", description: "White cotton lab coat", safetyInfo: "Wash after use", approval: true },
]

export default function ManageInventoryClient() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      try {
        // const response = await axios.get("/api/inventory/items")
        // setItems(response.data)
        setItems(mockItems)
      } catch (err) {
        setError("Failed to load inventory items")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }, 500)
  }, [])

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSave = async (updatedItem: Item) => {
    try {
      // const response = await axios.put(`/api/inventory/items/${updatedItem.id}`, updatedItem)
      // setItems(items.map(item => item.id === updatedItem.id ? response.data : item))
      setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item))
      setEditingItem(null)
      toast.success("Item updated successfully")
    } catch (err) {
      toast.error("Failed to update item")
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!deleteItemId) return
    
    try {
      // await axios.delete(`/api/inventory/items/${deleteItemId}`)
      setItems(items.filter(item => item.id !== deleteItemId))
      setDeleteItemId(null)
      toast.success("Item deleted successfully")
    } catch (err) {
      toast.error("Failed to delete item")
      console.error(err)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading inventory...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search items..."
          className="max-w-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button>Add New Item</Button>
      </div>

      <div className="overflow-hidden border rounded-lg shadow bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {item.description || "No description"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <DotsHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingItem(item)}>
                        Modify Item
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteItemId(item.id)}
                      >
                        Delete Item
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modify Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modify Item</DialogTitle>
            <DialogDescription>
              Update the item details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={editingItem.name}
                  className="col-span-3"
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={editingItem.description}
                  className="col-span-3"
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="safetyInfo" className="text-right">
                  Safety Info
                </Label>
                <Textarea
                  id="safetyInfo"
                  value={editingItem.safetyInfo}
                  className="col-span-3"
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, safetyInfo: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="approval" className="text-right">
                  Approved
                </Label>
                <Checkbox
                  id="approval"
                  checked={editingItem.approval}
                  onCheckedChange={(checked) =>
                    setEditingItem({ ...editingItem, approval: !!checked })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={() => editingItem && handleSave(editingItem)}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteItemId} onOpenChange={(open) => !open && setDeleteItemId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the item.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItemId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
