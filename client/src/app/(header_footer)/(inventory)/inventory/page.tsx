'use client';
import React, { useState, useEffect } from 'react';

import SearchFilterBar from '../components/SearchFilter';
import InventoryItem  from '../components/InventoryItem';

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

  const handleTake = (id: number) => {
    console.log(`Take item ${id}`);
  };

  const handleRestock = (id: number) => {
    console.log(`Restock item ${id}`);
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
          name={item.name}
          description={item.description}
          current_stock={1}
          unit={"Gram"}
          onTake={() => handleTake(item.id)}
          onRestock={() => handleRestock(item.id)}
          />
        ))}
      </div>
    </>
  );
};

export default Inventory;
