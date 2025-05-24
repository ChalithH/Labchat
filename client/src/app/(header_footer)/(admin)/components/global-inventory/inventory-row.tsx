"use client"
import type { InventoryItem } from "@/app/inventory/types"
import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface InventoryRowProps {
  item: InventoryItem
  isExpanded: boolean
  toggleExpand: () => void
  onSave: (updatedItem: InventoryItem) => void
  onDelete: (itemId: string) => void
}

export function MobileRow({ item, isExpanded, toggleExpand, onSave, onDelete }: InventoryRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editedItem, setEditedItem] = useState<InventoryItem>({...item})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedItem(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = () => {
    onSave(editedItem)
    setIsEditing(false)
  }

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={toggleExpand}>
        <div className="flex items-center space-x-3">
          <div className="ml-4">
            <p className="font-medium">{item.id}: {item.name}</p>
            <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
          </div>
        </div>
        <div>
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 bg-gray-50">
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-medium block">Name:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editedItem.name}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <p className="text-sm">{item.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-medium block">Quantity:</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="quantity"
                      value={editedItem.quantity}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <p className="text-sm">{item.quantity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-medium block">Category:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="category"
                      value={editedItem.category}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <p className="text-sm">{item.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-medium block">Location:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={editedItem.location}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <p className="text-sm">{item.location}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-medium block">Description:</label>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={editedItem.description}
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm">{item.description || "No description"}</p>
                )}
              </div>

              <div className="h-px bg-gray-200 my-3"></div>

              <div className="flex gap-2">
                {isEditing ? (
                  <Button 
                    onClick={handleSave}
                    className="w-full"
                    variant="default"
                  >
                    Confirm Changes
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="w-full"
                    variant="outline"
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Edit Item
                  </Button>
                )}
                
                <Button 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="w-full"
                  variant="destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Item
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {item.name} from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(item.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function DesktopRow({ item, isExpanded, toggleExpand, onSave, onDelete }: InventoryRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editedItem, setEditedItem] = useState<InventoryItem>({...item})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedItem(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = () => {
    onSave(editedItem)
    setIsEditing(false)
  }

  return (
    <>
      <tr className="hover:bg-gray-50 cursor-pointer" onClick={toggleExpand}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">{item.id}</div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm font-medium text-gray-900">{item.name}</div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-500 line-clamp-2">{item.description}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-gray-50">
          <td colSpan={4} className="px-6 py-4">
            <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
              <div className="max-h-80 overflow-y-auto pr-1">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-medium block">Name:</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={editedItem.name}
                          onChange={handleChange}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <p className="text-sm">{item.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium block">Quantity:</label>
                      {isEditing ? (
                        <input
                          type="number"
                          name="quantity"
                          value={editedItem.quantity}
                          onChange={handleChange}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <p className="text-sm">{item.quantity}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium block">Category:</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="category"
                          value={editedItem.category}
                          onChange={handleChange}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <p className="text-sm">{item.category}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium block">Location:</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="location"
                          value={editedItem.location}
                          onChange={handleChange}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <p className="text-sm">{item.location}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium block">Description:</label>
                    {isEditing ? (
                      <textarea
                        name="description"
                        value={editedItem.description}
                        onChange={handleChange}
                        className="border rounded px-2 py-1 w-full"
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm">{item.description || "No description"}</p>
                    )}
                  </div>

                  <div className="h-px bg-gray-200 my-3"></div>

                  <div className="flex gap-2">
                    {isEditing ? (
                      <Button 
                        onClick={handleSave}
                        className="w-full"
                        variant="default"
                      >
                        Confirm Changes
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setIsEditing(true)}
                        className="w-full"
                        variant="outline"
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Edit Item
                      </Button>
                    )}
                    
                    <Button 
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="w-full"
                      variant="destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Item
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {item.name} from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(item.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}