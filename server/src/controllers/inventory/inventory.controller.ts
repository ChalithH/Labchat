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
        const inventoryItems = await prisma.labInventoryItem.findMany();
        res.json(inventoryItems);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve inventory items' });
    }
}

/**
 * @swagger
 * /inventory:
 *   get:
 *     summary: Takes item(s) from the inventory
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: An updated inventory item
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LabInventoryItem'
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

          const updatedItem = await prisma.labInventoryItem.update({
            where: { id: itemId },
            data: {
              currentStock: item.currentStock - amountTaken,
            },
          });
      
          res.json(updatedItem);

    } catch (error) {
        res.status(500).json({ error: 'Failed to update item count' });
    }

}