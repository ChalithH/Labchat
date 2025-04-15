'use client';
import React, { useState } from 'react';

import SearchFilterBar from '../components/SearchFilter'
import { InventoryItem } from '../components/InventoryItem'

const Inventory = (): React.ReactNode => {
    const [activeItem, setActiveItem] = useState<number | null>(null);
  
    const toggleButtons = (id: number) => {
      setActiveItem(activeItem === id ? null : id);
    };
  
    const inventoryItems = [
      {
        id: 1,
        name: "Sodium Chloride (1kg jar)",
        quantity: 46,
        category: "Chemical",
        image: ""
      },
      {
        id: 2,
        name: "Nitrile Gloves (Box of 100)",
        quantity: 4,
        category: "Safety",
        image: ""
      },
      {
        id: 3,
        name: "Hydrochloric Acid (500ml Bottle)",
        quantity: 9,
        category: "Chemical",
        image: ""
      }
    ];
    return (
        <>
            <h1 className="flex justify-center items-center font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)]">Inventory</h1>
            <SearchFilterBar />
            <div className="mt-8 space-y-4 w-full max-w-2xl mx-auto">
            {inventoryItems.map((item) => (
            <div 
              key={item.id}
              className="border rounded-lg overflow-hidden shadow-sm bg-white cursor-pointer"
              onClick={() => toggleButtons(item.id)}
            >
              <div className="flex items-center p-4 border-b">
                <div className="w-16 h-16 bg-gray-200 rounded-lg mr-4 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                  <p className="text-gray-600">
                    <span className="font-medium">{item.quantity}</span> remaining
                  </p>
                </div>
              </div>
              
              {activeItem === item.id && (
                <div className="p-4 bg-gray-50 flex gap-3 border-t">
                  <button
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Take
                  </button>
                  <button
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Restock
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        </>
    )
}

export default Inventory
