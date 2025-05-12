const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type InventoryItem = {
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
  itemTags: unknown[];
  inventoryLogs: unknown[];
};

export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  const response = await fetch(`${BASE_URL}/inventory`);
  if (!response.ok) {
    throw new Error('Failed to fetch inventory items');
  }
  return response.json();
};

const postInventoryAction = async (
  endpoint: string,
  payload: Record<string, any>
): Promise<InventoryItem[]> => {
  const response = await fetch(`${BASE_URL}/inventory/${endpoint}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to ${endpoint} inventory item`);
  }
  return response.json();
};

export const takeInventoryItem = (id: number, amount: number) =>
  postInventoryAction('take', { itemId: id, amountTaken: amount });

export const replenishInventoryItem = (id: number, amount: number) =>
  postInventoryAction('replenish', { itemId: id, amountAdded: amount });
