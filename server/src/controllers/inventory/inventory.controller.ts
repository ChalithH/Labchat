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