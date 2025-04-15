import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getInventory = async (req: Request, res: Response): Promise<void> => {
    try {
        const inventoryItems = await prisma.labInventoryItem.findMany();
        res.json(inventoryItems);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve inventory items' });
    }
}