'use client';
import React, { useState, useEffect } from 'react';

import SearchFilterBar from '../components/SearchFilter';
import InventoryItem  from '../components/InventoryItem';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type InventoryItem = {
  id: number;
  itemId: number;
  labId: number;
  location: string;
  itemUnit: string;
  currentStock: number;
  minStock: number;
  updatedAt: string;
  item: {
    id: number;
    name: string;
    approval: boolean;
    description: string;
    safetyInfo: string;
  };
  itemTags: unknown[]; //change
  inventoryLogs: unknown[]; //change
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

  const takeInventoryItem = async (id:number, amount:number): Promise<InventoryItem[]> => {
    const response = await fetch(`${BASE_URL}/api/inventory/take`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({itemId: id, amountTaken: amount})
    });
    if (!response.ok) {
      throw new Error('Failed to take inventory item');
    }
    return response.json();
  };
  

  const handleTake = async(id: number) => {
    console.log(`Take item ${id}`);
    try {
      await takeInventoryItem(id, 1);
    } catch (error) {
      console.error('Failed to take inventory item', error) //out of stock or invalid id
    }
  };

  const replenishInventoryItem = async (id:number, amount:number): Promise<InventoryItem[]> => {
    const response = await fetch(`${BASE_URL}/api/inventory/replenish`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({itemId: id, amountAdded: amount})
    });
    if (!response.ok) {
      throw new Error('Failed to replenish inventory item');
    }
    return response.json();
  };

  const handleRestock = async(id: number) => {
    console.log(`Restock item ${id}`);
    try {
      await replenishInventoryItem(id, 1);
    } catch (error) {
      console.error('Failed to replenish inventory item', error) //invalid id
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
