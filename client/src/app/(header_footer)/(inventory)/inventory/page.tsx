'use client';
import React, { useState, useEffect } from 'react';

import SearchFilterBar from '../components/SearchFilter';
import { InventoryItem as InventoryItemComponent } from '../components/InventoryItem';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type InventoryItem = {
  id: number;
  name: string;
  description: string;
  safteyInfo: string | null;
  approval: boolean;
};

type InventoryItemLocal = {
  inventory_item_id: number;
  item_id: number;
  lab_id: number;
  location: string;
  item_unit: string;
  current_stock: number;
  min_stock: number;
  updated_at: Date;
};

type CombinedInventoryItem = InventoryItem & InventoryItemLocal;

const getInventoryItems = async (): Promise<InventoryItem[]> => {
  const response = await fetch(`${BASE_URL}/api/inventory`);
  if (!response.ok) {
    throw new Error('Failed to fetch inventory items');
  }
  return response.json();
};

const getInventoryItemsLocal = async (): Promise<InventoryItemLocal[]> => {
  const response = await fetch(`${BASE_URL}/api/inventory/local`);
  if (!response.ok) {
    throw new Error('Failed to fetch local inventory items');
  }
  return response.json();
};

const Inventory = (): React.ReactNode => {
  const [combinedItems, setCombinedItems] = useState<CombinedInventoryItem[]>([]);
  const [activeItem, setActiveItem] = useState<number | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const [items, localItems] = await Promise.all([
          getInventoryItems(),
          getInventoryItemsLocal(),
        ]);

        const mergedItems: CombinedInventoryItem[] = localItems.map((local) => {
          const item = items.find((i) => i.id === local.item_id);
          if (!item) return null;
          return {
            ...item,
            ...local,
          };
        }).filter(Boolean) as CombinedInventoryItem[];

        setCombinedItems(mergedItems);
      } catch (error) {
        console.error('Error fetching or merging inventory items:', error);
      }
    };

    fetchItems();
  }, []);

  const toggleButtons = (id: number) => {
    setActiveItem(activeItem === id ? null : id);
  };

  return (
    <>
      <h1 className="flex justify-center items-center font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)]">
        Inventory
      </h1>
      <SearchFilterBar />
      <div className="mt-8 space-y-4 w-full max-w-2xl mx-auto">
        {combinedItems.map((item) => (
          <InventoryItemComponent
            key={item.id}
            name={item.name}
            description={item.description}
            current_stock={item.current_stock}
            unit={item.item_unit}
          />
        ))}
      </div>
    </>
  );
};

export default Inventory;
