"use client"
import { ChevronDown, ChevronRight, Pencil, Trash2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { InventoryItem } from "./types"
import { useState } from "react"

// Shared hook for both components
const useInventoryRow = (item: InventoryItem) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedItem, setEditedItem] = useState<InventoryItem>({ ...item })

  const handleEditClick = () => setIsEditing(true)
  
  const handleCancel = () => {
    setIsEditing(false)
    setEditedItem({ ...item })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedItem(prev => ({ ...prev, [name]: value }))
  }

  const handleApprovalChange = (checked: boolean) => {
    setEditedItem(prev => ({ ...prev, approval: checked }))
  }

  return {
    isEditing,
    setIsEditing,
    editedItem,
    handleEditClick,
    handleCancel,
    handleChange,
    handleApprovalChange
  }
}

type CommonProps = {
  item: InventoryItem
  isExpanded: boolean
  toggleExpand: () => void
  onEdit: (updatedItem: InventoryItem) => void
  onDelete: () => void
}

// Shared form section component
const InventoryFormSection = ({
  isEditing,
  editedItem,
  handleChange,
  handleApprovalChange
}: {
  isEditing: boolean
  editedItem: InventoryItem
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleApprovalChange: (checked: boolean) => void
}) => (
  <>
    <div className="space-y-2">
      <Label className="block text-sm font-medium">Name</Label>
      <Input
        name="name"
        value={editedItem.name}
        onChange={handleChange}
        disabled={!isEditing}
      />
    </div>
    <div className="space-y-2">
      <Label className="block text-sm font-medium">Description</Label>
      <Textarea
        name="description"
        value={editedItem.description ?? ''}
        onChange={handleChange}
        disabled={!isEditing}
      />
    </div>
    <div className="space-y-2">
      <Label className="block text-sm font-medium">Safety Info</Label>
      <Input
        name="safetyInfo"
        value={editedItem.safetyInfo || ''}
        onChange={handleChange}
        disabled={!isEditing}
      />
    </div>
    <div className="flex items-center space-x-2">
      <Label htmlFor="approval-status" className="text-sm font-medium">
        Approval Status
      </Label>
      <div className="flex items-center gap-2">
        <span className="text-sm">{editedItem.approval ? "Approved" : "Pending"}</span>
        {isEditing && (
          <Switch
            id="approval-status"
            checked={editedItem.approval}
            onCheckedChange={handleApprovalChange}
          />
        )}
      </div>
    </div>
  </>
)

// Mobile row component
export const InventoryRow = ({ item, isExpanded, toggleExpand, onEdit, onDelete }: CommonProps) => {
  const {
    isEditing,
    setIsEditing,
    editedItem,
    handleEditClick,
    handleCancel,
    handleChange,
    handleApprovalChange
  } = useInventoryRow(item)

  const handleSubmit = () => {
    onEdit(editedItem)
    setIsEditing(false)
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={toggleExpand}
      >
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900">{item.name}</p>
          <p className="text-xs text-gray-500">ID: {item.id}</p>
        </div>
        <div className="flex items-center space-x-3">
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 bg-gray-50">
          <div className="border border-gray-200 rounded-md bg-white p-4 space-y-4">
            <InventoryFormSection 
              isEditing={isEditing}
              editedItem={editedItem}
              handleChange={handleChange}
              handleApprovalChange={handleApprovalChange}
            />
            <div className="flex justify-center gap-2 pt-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button onClick={handleSubmit}>
                    <Save className="h-4 w-4 mr-1" /> Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="default" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditClick()
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-1" /> Edit Item
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete()
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete Item
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Desktop table row component
export const InventoryTableRow = ({ item, isExpanded, toggleExpand, onEdit, onDelete }: CommonProps) => {
  const {
    isEditing,
    setIsEditing,
    editedItem,
    handleEditClick,
    handleCancel,
    handleChange,
    handleApprovalChange
  } = useInventoryRow(item)

  const handleSubmit = () => {
    onEdit(editedItem)
    setIsEditing(false)
  }

  return (
    <>
      <tr 
        className={`hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`}
        onClick={toggleExpand}
      >
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {item.id}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {item.name}
        </td>
        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
          {item.description || "No description"}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.approval ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
            {item.approval ? "Approval Required" : "Available for Use"}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} className="px-6 py-4 bg-gray-50 border-t">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <InventoryFormSection 
                    isEditing={isEditing}
                    editedItem={editedItem}
                    handleChange={handleChange}
                    handleApprovalChange={handleApprovalChange}
                  />
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                      <Save className="h-4 w-4 mr-1" /> Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="default" 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditClick()
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Edit Item
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete()
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete Item
                    </Button>
                  </>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}