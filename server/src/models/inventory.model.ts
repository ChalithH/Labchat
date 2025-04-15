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
 *         itemId:
 *           type: integer
 *         labId:
 *           type: integer
 *         location:
 *           type: string
 *         itemUnit:
 *           type: string
 *         currentStock:
 *           type: integer
 *         minStock:
 *           type: integer
 *         updatedAt:
 *           type: string
 *           format: date-time
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

 *     Item:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string

 *     Lab:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string

 *     ItemTag:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string

 *     InventoryLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         change:
 *           type: integer
 *         timestamp:
 *           type: string
 *           format: date-time
 */
