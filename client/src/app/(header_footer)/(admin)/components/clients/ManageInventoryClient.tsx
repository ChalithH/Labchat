"use client"

import React, { useState } from "react"
import InventoryTable from "../global-inventory/InventoryTable"
import SearchFilterBar from "@/components/labchat/SearchFilter"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"


import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type FilterOption = {
  label: string
  value: string
}

type InventoryItem = {
  id: string
  name: string
  description: string
  safetyInfo?: string
  approval?: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ManageInventoryClient: React.FC = () => {
  // State for search and filter
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('id-asc')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    description: '',
    safetyInfo: '',
    approval: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Define filter options for inventory
  const availableStatusOptions: FilterOption[] = [
    { label: 'ID (ascending)', value: 'id-asc' },
    { label: 'ID (descending)', value: 'id-desc' },
    { label: 'name (a-z)', value: 'name-asc' },
    { label: 'name (z-a)', value: 'name-desc' },
  ]

  const handleAddItem = () => {
    setIsAddDialogOpen(true)
    setSubmitError(null)
  }

  const handleCancelAdd = () => {
    setIsAddDialogOpen(false)
    setNewItem({
      name: '',
      description: '',
      safetyInfo: '',
      approval: false
    })
    setSubmitError(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewItem(prev => ({ ...prev, [name]: value }))
  }

  const handleApprovalChange = (checked: boolean) => {
    setNewItem(prev => ({ ...prev, approval: checked }))
  }

  const handleSubmit = async () => {
    if (!newItem.name) {
      setSubmitError('Name is required')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch(`${API_URL}/admin/create-global-item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create item')
      }

      const createdItem = await response.json()
      // You might want to update your local state or refetch items here
      setIsAddDialogOpen(false)
      setNewItem({
        name: '',
        description: '',
        safetyInfo: '',
        approval: false
      })

      // Optionally refresh the inventory table
      window.location.reload() // Simple solution, consider better state management
    } catch (error) {
      console.error('Error creating item:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to create item')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-screen-xl mx-auto w-full px-4 py-6">
      {/* Responsive header with breadcrumb */}
      <div className="relative flex flex-col items-center mb-8 lg:flex-row lg:justify-center">
        <h1 className="font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)] text-center order-1 lg:order-none">
          Manage Global Inventory
        </h1>
        <div className="lg:absolute lg:left-0 order-2 lg:order-none mb-2 lg:mb-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Manage Inventory</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterOptions={availableStatusOptions}
        filterValue={filterCategory}
        setFilterValue={setFilterCategory}
      />

      {/* Centered Add Item Button */}
      <div className="flex justify-center mt-4 mb-0">
        <Button
          onClick={handleAddItem}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Add New Item
        </Button>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name*
              </Label>
              <Input
                id="name"
                name="name"
                value={newItem.name}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={newItem.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="safetyInfo" className="text-right">
                Safety Info
              </Label>
              <Textarea
                id="safetyInfo"
                name="safetyInfo"
                value={newItem.safetyInfo || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="approval" className="text-right">
                Approved
              </Label>
              <Switch
                id="approval"
                checked={newItem.approval}
                onCheckedChange={handleApprovalChange}
              />
            </div>
          </div>

          {submitError && (
            <div className="text-red-500 text-sm text-center mb-4">
              {submitError}
            </div>
          )}

          <DialogFooter className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleCancelAdd}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-6">
        <InventoryTable
          searchQuery={searchQuery}
          statusFilter={filterCategory}
        />
      </div>
    </div>
  )
}

export default ManageInventoryClient