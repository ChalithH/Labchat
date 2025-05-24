"use client"
import axios from "axios";
import { useState, useEffect } from "react"
import type { InventoryItem } from "@/app/inventory/types"
import { MobileRow, DesktopRow } from "./inventory-row"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Props = {
  searchQuery: string;
};

export default function InventoryTable({ searchQuery }: Props) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/inventory`);
        if (response.status !== 200) {
          throw new Error("Failed to fetch inventory items")
        }

        const data = await response.data;
        setItems(data)
      } catch (err) {
        setError("Failed to load inventory items. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleSaveItem = async (updatedItem: InventoryItem) => {
    try {
      const response = await axios.put(`${API_URL}/inventory/${updatedItem.id}`, updatedItem);
      if (response.status === 200) {
        setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item))
      }
    } catch (err) {
      setError("Failed to update item")
      console.error(err)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await axios.delete(`${API_URL}/inventory/${itemId}`);
      if (response.status === 200) {
        setItems(items.filter(item => item.id !== itemId))
      }
    } catch (err) {
      setError("Failed to delete item")
      console.error(err)
    }
  }

  const filteredItems = items.filter((item) => {
    return (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) {
    return <div className="text-center py-8">Loading inventory...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className="overflow-hidden border rounded-lg shadow bg-white">
      {/* Mobile view (hidden on md and larger screens) */}
      <div className="md:hidden divide-y">
        {filteredItems.map((item) => (
          <MobileRow
            key={item.id}
            item={item}
            isExpanded={expandedId === item.id}
            toggleExpand={() => toggleExpand(item.id)}
            onSave={handleSaveItem}
            onDelete={handleDeleteItem}
          />
        ))}
      </div>

      {/* Desktop view (hidden on smaller than md screens) */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Description
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Expand</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <DesktopRow
                key={item.id}
                item={item}
                isExpanded={expandedId === item.id}
                toggleExpand={() => toggleExpand(item.id)}
                onSave={handleSaveItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}