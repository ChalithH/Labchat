import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


/**
 * @swagger
 * /inventory:
 *   get:
 *     summary: Get all lab inventory items
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: A list of inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LabInventoryItem'
 *       500:
 *         description: Failed to retrieve inventory items
 */

export const getInventory = async (req: Request, res: Response): Promise<void> => {
    try {
        const inventoryItems = await prisma.item.findMany();
        res.json(inventoryItems);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve inventory items' });
    }
}

/**
 * @swagger
 * /inventory/take:
 *   post:
 *     summary: Takes item(s) from the inventory
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: integer
 *                 description: The ID of the inventory item
 *               amountTaken:
 *                 type: integer
 *                 description: The amount of the item to take
 *             required:
 *               - itemId
 *               - amountTaken
 *     responses:
 *       200:
 *         description: An updated inventory item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabInventoryItem'
 *       404:
 *         description: Item not found
 *       400:
 *         description: Not enough stock available
 *       500:
 *         description: Failed to update inventory item
 */

export const takeItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const { itemId, amountTaken } = req.body;
        const item = await prisma.labInventoryItem.findUnique({
            where: { id: itemId },
          });

          if (!item) {
            res.status(404).json({ error: 'Item not found' });
            return;
          }

          if (item.currentStock < amountTaken) {
            res.status(400).json({ error: 'Not enough stock available' });
            return;
          }

          const updatedItem = await prisma.labInventoryItem.update({
            where: { id: itemId },
            data: {
              currentStock: item.currentStock - amountTaken,
              updatedAt: new Date(),
            },
          });
      
          res.json(updatedItem);

    } catch (error) {
        res.status(500).json({ error: 'Failed to update item count' });
    }

}

/**
 * @swagger
 * /inventory/low-stock:
 *   get:
 *     summary: Returns a list of all low stock items
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: A list of low stock items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabInventoryItem'
 *       500:
 *         description: Failed to retrieve low stock items
 */

export const getAllLowStockItems = async (req: Request, res: Response): Promise<void> => {
    try {
        const allItems = await prisma.labInventoryItem.findMany();
        const lowStockItems = allItems.filter(item => item.currentStock <= item.minStock);
        res.json(lowStockItems);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve low stock items' });
    }
}