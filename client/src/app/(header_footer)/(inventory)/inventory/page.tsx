'use client';
import React, { useState, useEffect } from 'react';
import SearchFilterBar from '../components/SearchFilter';
import InventoryItem from '../components/InventoryItem';

import {
  getInventoryItems,
  takeInventoryItem,
  replenishInventoryItem,
  InventoryItem as InventoryItemType,
} from '@/lib/inventoryService';

const Inventory = (): React.ReactNode => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItemType[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const items = await getInventoryItems();
        setInventoryItems(items);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
      }
    };

    fetchItems();
  }, []);

  const handleTake = async (id: number) => {
    try {
      await takeInventoryItem(id, 1);
    } catch (error) {
      console.error('Failed to take inventory item', error);
    }
  };

  const handleRestock = async (id: number) => {
    try {
      await replenishInventoryItem(id, 1);
    } catch (error) {
      console.error('Failed to replenish inventory item', error);
    }
  };

  return (
    <>
      <h1 className="flex justify-center items-center font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)]">
        Inventory
      </h1>
      <SearchFilterBar />
      <div className="mt-8 space-y-4 w-full max-w-2xl mx-auto">
        {inventoryItems.map((item) => (
          <InventoryItem
            key={item.id}
            name={item.item.name}
            description={item.item.description}
            current_stock={item.currentStock}
            unit={item.itemUnit}
            onTake={() => handleTake(item.id)}
            onRestock={() => handleRestock(item.id)}
          />
        ))}
      </div>
    </>
  );
};

export default Inventory;
