import React from 'react';
import type { InventoryItem } from './types';

interface InventoryCardProps {
  item: InventoryItem;
}

export default function InventoryCard({ item }: InventoryCardProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded shadow p-3 gap-2">
      <span className="text-gray-600 text-base">{item.name}</span>
      <span className="text-red-500 font-semibold text-base">
        {item.remaining} remaining out of {item.minStock} minimum
      </span>
    </div>
  );
} 