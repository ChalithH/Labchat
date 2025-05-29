const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type Tag = {
  id: number;
  name: string;
  description: string;
};

export type InventoryItem = {
  id: number;
  labId: number;
  location: string;
  itemUnit: string;
  currentStock: number;
  minStock: number;
  item: {
    id: number;
    name: string;
    approval: boolean;
    description: string;
    safetyInfo: string;
  };
  itemTags: Tag[];
};

export const getInventoryItems = async (labId: number): Promise<InventoryItem[]> => {
  const response = await fetch(`${BASE_URL}/inventory/${labId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch inventory items');
  }
  return response.json();
};

// Fetch all available item tags
export const getItemTags = async (): Promise<Tag[]> => {
  try {
    const response = await fetch(`${BASE_URL}/inventory/item-tags`);
    if (!response.ok) {
      throw new Error('Failed to fetch item tags');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getItemTags:', error);
    throw error;
  }
};

const postInventoryAction = async (
  endpoint: string,
  payload: Record<string, unknown>
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

export const takeInventoryItem = (id: number, amount: number, labId: number) =>
  postInventoryAction('take', { itemId: id, amountTaken: amount, labId: labId });

export const replenishInventoryItem = (id: number, amount: number, labId: number) =>
  postInventoryAction('replenish', { itemId: id, amountAdded: amount, labId: labId });
