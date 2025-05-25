// types.ts
export type InventoryItem = {
  id: string
  name: string
  description: string
  safetyInfo?: string
  approval?: boolean
}