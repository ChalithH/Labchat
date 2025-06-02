"use client";

import { useState, useEffect, useCallback } from "react";
import { useCurrentLabId } from "@/contexts/lab-context";
import { getInventoryItems, takeInventoryItem, replenishInventoryItem, getItemTags } from "@/lib/inventoryService";
import type { InventoryItem, Tag } from "@/lib/inventoryService";

export function useInventoryData() {
  const currentLabId = useCurrentLabId();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch inventory items for the current lab
  const fetchInventoryItems = useCallback(async () => {
    try {
      setError(null);
      const items = await getInventoryItems(currentLabId);
      setInventoryItems(items);
      return items;
    } catch (err) {
      console.error("Failed to fetch inventory items:", err);
      setError("Failed to fetch inventory items");
      return [];
    }
  }, [currentLabId]);

  // Fetch available tags
  const fetchTags = useCallback(async () => {
    try {
      const tags = await getItemTags();
      setAvailableTags(tags);
      return tags;
    } catch (err) {
      console.error("Failed to fetch tags:", err);
      setError("Failed to fetch tags");
      return [];
    }
  }, []);

  // Initialize data when lab changes
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchInventoryItems(),
          fetchTags()
        ]);
      } catch (err) {
        console.error("Failed to initialize inventory data:", err);
        setError("Failed to initialize inventory data");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [currentLabId, fetchInventoryItems, fetchTags]);

  // Wrapper functions that automatically use current lab context
  const takeItemForCurrentLab = useCallback(async (itemId: number, amount: number) => {
    try {
      await takeInventoryItem(itemId, amount, currentLabId);
      await fetchInventoryItems(); // Refresh data
      return true;
    } catch (err) {
      console.error("Failed to take inventory item:", err);
      setError("Failed to take inventory item");
      return false;
    }
  }, [currentLabId, fetchInventoryItems]);

  const replenishItemForCurrentLab = useCallback(async (itemId: number, amount: number) => {
    try {
      await replenishInventoryItem(itemId, amount, currentLabId);
      await fetchInventoryItems(); // Refresh data
      return true;
    } catch (err) {
      console.error("Failed to replenish inventory item:", err);
      setError("Failed to replenish inventory item");
      return false;
    }
  }, [currentLabId, fetchInventoryItems]);

  return {
    currentLabId,
    inventoryItems,
    availableTags,
    loading,
    error,
    fetchInventoryItems,
    fetchTags,
    takeItem: takeItemForCurrentLab,
    replenishItem: replenishItemForCurrentLab,
    setInventoryItems,
  };
} 