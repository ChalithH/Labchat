'use client';

import React, { useEffect, useState } from 'react';
import { getInventoryItems, replenishInventoryItem, takeInventoryItem } from '@/lib/inventoryService';
import InventoryItem from '../components/InventoryItem';
import SearchFilterBar from '../components/SearchFilter';

type InventoryItemData = {
  id: number;
  item: {
    name: string;
    description: string;
    category?: string;
  };
  currentStock: number;
  itemUnit: string;
};

const Inventory: React.FC = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItemData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');

  const fetchItems = async (): Promise<void> => {
    try {
      const items: InventoryItemData[] = await getInventoryItems();
      const sortedItems = [...items].sort((a, b) =>
        a.item.name.localeCompare(b.item.name)
      );
      setInventoryItems(sortedItems);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

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

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = item.item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      !filterCategory || item.item.category?.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesFilter;
  });

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
      />
      <div className="mt-8 space-y-4 w-full max-w-2xl mx-auto">
        {filteredItems.map((item) => (
          <InventoryItem
            key={item.id}
            name={item.item.name}
            description={item.item.description}
            current_stock={item.currentStock}
            unit={item.itemUnit}
            onTake={(amount: number) => handleTake(item.id, amount)}
            onRestock={(amount: number) => handleRestock(item.id, amount)}
            refreshStockData={refreshStockData}
          />
        ))}
      </div>
    </>
  );
};

export default Inventory;
