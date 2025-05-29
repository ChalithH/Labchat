'use client';

import React, { useState } from 'react';
import { useInventoryData } from '../hooks/use-inventory-data';
import InventoryItem from '../components/InventoryItem';
import SearchFilterBar from '@/components/labchat/SearchFilter'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Tag type definition
type Tag = {
  id: number;
  name: string;
  description: string;
};

// This component is used to display the inventory items and provide options to search and filter them.
// It fetches the inventory items from the server and manages the state of the inventory items, search query, and filter category.

type InventoryItemData = {
  id: number;
  currentStock: number;
  minStock: number;
  itemUnit: string;
  location: string;
  item: {
    name: string;
    description: string;
  };
  itemTags: Tag[];
};

// Define the type for the user prop
interface UserSessionData {
  id: number;
  lastViewedLabId?: number; 
  // Add other relevant user fields if needed by this component
}

interface InventoryClientProps {
  user: UserSessionData;
}

const InventoryClient: React.FC<InventoryClientProps> = ({ user }) => {
  const {
    inventoryItems,
    availableTags,
    loading,
    error,
    takeItem,
    replenishItem,
    fetchInventoryItems
  } = useInventoryData();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('name-asc');

  const refreshStockData = async (): Promise<void> => {
    await fetchInventoryItems();
  };

  const handleTake = async (id: number, amount: number): Promise<void> => {
    await takeItem(id, amount);
  };

  const handleRestock = async (id: number, amount: number): Promise<void> => {
    await replenishItem(id, amount);
  };

  const filteredItems = [...inventoryItems]
    .filter((item) => {
      // Handle search query filtering
      const matchesSearch = item.item.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Handle category filtering
      let matchesFilter = true;

      if (filterCategory === 'low-stock') {
        // Filter for low stock items
        matchesFilter = item.currentStock <= item.minStock;
      } else if (filterCategory.startsWith('tag:')) {
        // Filter by specific tag ID
        const tagId = parseInt(filterCategory.replace('tag:', ''));
        matchesFilter = item.itemTags.some(tag => tag.id === tagId);
      }

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.item.name.localeCompare(b.item.name);
        case 'name-desc':
          return b.item.name.localeCompare(a.item.name);
        case 'stock-high':
          return (
            (b.currentStock / Math.max(b.minStock, 1)) -
            (a.currentStock / Math.max(a.minStock, 1))
          );
        case 'stock-low':
          return (
            (a.currentStock / Math.max(a.minStock, 1)) -
            (b.currentStock / Math.max(b.minStock, 1))
          );
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading inventory...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <h1 className="flex justify-center items-center font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)]">
        Inventory
      </h1>
      <SearchFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterOptions={[
          { label: 'All Items', value: '' },
          { label: 'Low Stock', value: 'low-stock' },
          ...availableTags.map(tag => ({
            label: tag.name,
            value: `tag:${tag.id}`,
          })),
        ]}
        filterValue={filterCategory}
        setFilterValue={setFilterCategory}
      />
      <div className="w-full max-w-2xl mx-auto mt-4 px-4 flex justify-center">
        <div className="flex items-center space-x-2">
          <label htmlFor="sort" className="text-sm font-semibold text-gray-700">Sort By:</label>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select sort option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="stock-high">High Stock %</SelectItem>
              <SelectItem value="stock-low">Low Stock %</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-8 space-y-4 w-full max-w-2xl mx-auto">
        {filteredItems.map((item) => (
          <InventoryItem
            key={item.id}
            name={item.item.name}
            description={item.item.description}
            current_stock={item.currentStock}
            min_stock={item.minStock}
            unit={item.itemUnit}
            tags={item.itemTags}
            onTake={(amount: number) => handleTake(item.id, amount)}
            onRestock={(amount: number) => handleRestock(item.id, amount)}
            refreshStockData={refreshStockData}
          />
        ))}
      </div>
    </>
  );
};

export default InventoryClient;