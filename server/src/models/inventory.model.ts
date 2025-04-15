/**
 * @swagger
 * components:
 *   schemas:
 *     LabInventoryItem:
 *       type: object
 *       required:
 *         - id
 *         - itemId
 *         - labId
 *         - location
 *         - itemUnit
 *         - currentStock
 *         - minStock
 *         - updatedAt
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the lab inventory item
 *         itemId:
 *           type: integer
 *           description: The ID of the associated item
 *         labId:
 *           type: integer
 *           description: The ID of the lab this inventory item belongs to
 *         location:
 *           type: string
 *           description: The physical location of the item within the lab
 *         itemUnit:
 *           type: string
 *           description: The unit of measurement for this item
 *         currentStock:
 *           type: integer
 *           description: The current stock level
 *         minStock:
 *           type: integer
 *           description: The minimum required stock level
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of the last update
 *         item:
 *           $ref: '#/components/schemas/Item'
 *         lab:
 *           $ref: '#/components/schemas/Lab'
 *         itemTags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ItemTag'
 *         inventoryLogs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/InventoryLog'
 *       example:
 *         id: 1
 *         itemId: 10
 *         labId: 3
 *         location: "Shelf A3"
 *         itemUnit: "bottle"
 *         currentStock: 25
 *         minStock: 5
 *         updatedAt: "2025-04-08T00:00:00.000Z"
 *         item:
 *           id: 10
 *           name: "Ethanol"
 *         lab:
 *           id: 3
 *           name: "Chemistry Lab"
 *         itemTags:
 *           - id: 1
 *             name: "flammable"
 *           - id: 2
 *             name: "chemical"
 *         inventoryLogs:
 *           - id: 100
 *             action: "restock"
 *             quantity: 10
 *             timestamp: "2025-04-01T12:00:00.000Z"
 */
