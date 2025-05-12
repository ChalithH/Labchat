'use client';

import React, { useEffect, useState } from 'react';
import { getInventoryItems, replenishInventoryItem, takeInventoryItem } from '@/lib/inventoryService';
import InventoryItem from '../components/InventoryItem';
import SearchFilterBar from '../components/SearchFilter';

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

const InventoryClient: React.FC = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItemData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('name-asc');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  // Fetch all available tags from the API
  const fetchTags = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:8000/api/inventory/item-tags');
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      const tags = await response.json();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchItems = async (): Promise<void> => {
    try {
      const itemsRaw = await getInventoryItems();
      const items: InventoryItemData[] = itemsRaw.map((item) => ({
        id: item.id,
        currentStock: item.currentStock,
        minStock: item.minStock,
        itemUnit: item.itemUnit,
        location: item.location || '', // Ensure location is included
        item: {
          name: item.item.name,
          description: item.item.description,
        },
        itemTags: item.itemTags,
      }));
      
      const sortedItems = [...items].sort((a, b) =>
        a.item.name.localeCompare(b.item.name)
      );
      setInventoryItems(sortedItems);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    }
  };

  const refreshStockData = async (): Promise<void> => {
    await fetchItems();
  };

  const handleTake = async (id: number, amount: number): Promise<void> => {
    await takeInventoryItem(id, amount);
    refreshStockData();
  };

  const handleRestock = async (id: number, amount: number): Promise<void> => {
    await replenishInventoryItem(id, amount);
    refreshStockData();
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

  useEffect(() => {
    fetchItems();
    fetchTags();
  }, []);

  return (
    <>
      <h1 className="flex justify-center items-center font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)]">
        Inventory
      </h1>
      <SearchFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        availableTags={availableTags}
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