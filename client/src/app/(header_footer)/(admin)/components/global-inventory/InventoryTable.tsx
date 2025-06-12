"use client"
import { useState, useEffect, useMemo } from "react"
import { InventoryRow, InventoryTableRow } from "./InventoryRow"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"

const API_URL = process.env.NEXT_PUBLIC_API_URL

type InventoryItem = {
  id: string
  name: string
  description: string
  safetyInfo?: string
  approval?: boolean
}

type Props = {
  searchQuery: string;
  statusFilter: string;
};

export default function InventoryTable({ searchQuery, statusFilter }: Props) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  // Filter and sort items based on searchQuery and statusFilter
// In your InventoryTable component, update the filteredItems useMemo hook:

const filteredItems = useMemo(() => {
  let result = [...items];
  
  // Apply search filter (search by ID or name)
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(item => 
      item.id.toLowerCase().includes(query) || 
      item.name.toLowerCase().includes(query)
    );
  }
  
  // Apply sorting based on statusFilter
  switch (statusFilter) {
    case 'id-asc':
      // Convert IDs to numbers for proper numeric sorting
      result.sort((a, b) => Number(a.id) - Number(b.id));
      break;
    case 'id-desc':
      result.sort((a, b) => Number(b.id) - Number(a.id));
      break;
    case 'name-asc':
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      result.sort((a, b) => b.name.localeCompare(a.name));
      break;
    default:
      // Default sorting (no change)
      break;
  }
  
  return result;
}, [items, searchQuery, statusFilter]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/get-all-items`, {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include'
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.message || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        const formattedItems = data.map((item: any) => ({
          ...item,
          id: item.id.toString()
        }))
        setItems(formattedItems)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleEdit = async (updatedItem: InventoryItem) => {
    try {
      const response = await fetch(
        `${API_URL}/admin/update-item/${updatedItem.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(updatedItem),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setItems(prevItems => prevItems.map(item => 
        item.id === updatedItem.id ? data : item
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item')
    }
  }

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    
    try {
      const response = await fetch(
        `${API_URL}/admin/delete-item/${itemToDelete}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setItems(prevItems => prevItems.filter(item => item.id !== itemToDelete))
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      if (expandedId === itemToDelete) {
        setExpandedId(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
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
      {/* Mobile view */}
      <div className="md:hidden space-y-2">
        {filteredItems.map((item) => (
          <InventoryRow
            key={item.id}
            item={item}
            isExpanded={expandedId === item.id}
            toggleExpand={() => toggleExpand(item.id)}
            onEdit={handleEdit}
            onDelete={() => handleDeleteClick(item.id)}
          />
        ))}
      </div>

      {/* Desktop view */}
      <div className="hidden md:block overflow-hidden border rounded-lg shadow bg-white">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <InventoryTableRow
                key={item.id}
                item={item}
                isExpanded={expandedId === item.id}
                toggleExpand={() => toggleExpand(item.id)}
                onEdit={handleEdit}
                onDelete={() => handleDeleteClick(item.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the inventory item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}