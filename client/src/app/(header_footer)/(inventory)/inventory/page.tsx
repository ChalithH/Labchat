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

const getInventoryItems = async (): Promise<InventoryItem[]> => {
  const response = await fetch(`${BASE_URL}/api/inventory`);
  if (!response.ok) {
    throw new Error('Failed to fetch inventory items');
  }
  return response.json();
};

const Inventory = (): React.ReactNode => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [activeItem, setActiveItem] = useState<number | null>(null);

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
        {inventoryItems.map((item) => (
          <InventoryItemComponent
            key={item.id}
            name={item.name}
            description={item.description}
            safetyInfo={item.safteyInfo}
            approval={item.approval}
            quantity={1} // Placeholder quantity
          />
        ))}
      </div>
    </>
  );
};

export default Inventory;
