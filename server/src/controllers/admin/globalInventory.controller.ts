import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /admin/get-all-items:
 *   get:
 *     summary: Get all inventory items
 *     description: Retrieves a list of all inventory items with their details
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: A list of inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The item ID
 *                   name:
 *                     type: string
 *                     description: The item name
 *                   description:
 *                     type: string
 *                     nullable: true
 *                     description: The item description
 *                   safetyInfo:
 *                     type: string
 *                     nullable: true
 *                     description: Safety information about the item
 *                   approval:
 *                     type: boolean
 *                     description: Whether the item is approved
 *                   labInventory:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/LabInventoryItem'
 *       500:
 *         description: Internal server error
 */
export const getAllItems = async (req: Request, res: Response): Promise<void> => {
    try {
        const items = await prisma.item.findMany({
            include: {
                labInventory: false
            },
            orderBy: {
                id: 'asc'
            }
        });
        res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * @swagger
 * /admin/get-available-items-for-lab/{labId}:
 *   get:
 *     summary: Get all global items not already in a specific lab
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The lab ID to check for available items
 *     responses:
 *       200:
 *         description: Available items for the lab
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Item ID
 *                   name:
 *                     type: string
 *                     description: Item name
 *                   description:
 *                     type: string
 *                     description: Item description
 *                   safetyInfo:
 *                     type: string
 *                     description: Safety information
 *                   approval:
 *                     type: boolean
 *                     description: Whether the item is approved
 *       400:
 *         description: Invalid lab ID
 *       403:
 *         description: Forbidden - insufficient permissions for this lab
 *       404:
 *         description: Lab not found
 *       500:
 *         description: Internal server error
 */
export const getAvailableItemsForLab = async (req: Request, res: Response): Promise<void> => {
    try {
        const labId = parseInt(req.params.labId);
        
        if (isNaN(labId)) {
            res.status(400).json({ error: 'Invalid lab ID' });
            return;
        }

        // Check if lab exists
        const lab = await prisma.lab.findUnique({
            where: { id: labId }
        });

        if (!lab) {
            res.status(404).json({ error: 'Lab not found' });
            return;
        }

        // Get all global items (filtering is done client-side)
        const availableItems = await prisma.item.findMany({
            orderBy: {
                id: 'asc'
            }
        });

        res.status(200).json(availableItems);
    } catch (error) {
        console.error('Error fetching available items for lab:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * @swagger
 * /admin/create-global-item:
 *   post:
 *     summary: Create a new inventory item
 *     description: Adds a new item to the inventory
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the item
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Description of the item
 *               safetyInfo:
 *                 type: string
 *                 nullable: true
 *                 description: Safety information
 *               approval:
 *                 type: boolean
 *                 description: Approval status
 *     responses:
 *       201:
 *         description: Item created successfully
 *       400:
 *         description: Bad request (missing required fields)
 *       500:
 *         description: Internal server error
 */
export const createGlobalItem = async (req: Request, res: Response): Promise<void> => {
    const { name, description, safetyInfo, approval } = req.body;

    if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
    }

    try {
        const newItem = await prisma.item.create({
            data: {
                id: undefined, // Allow Prisma to auto-generate ID
                name,
                description: description || null,
                safetyInfo: safetyInfo || null,
                approval: approval || false
            }
        });
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error creating inventory item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * @swagger
 * /admin/update-item/{id}:
 *   put:
 *     summary: Update an existing inventory item
 *     description: Updates the name, description, safety info, or approval status of an item
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               safetyInfo:
 *                 type: string
 *                 nullable: true
 *               approval:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       400:
 *         description: Invalid request or missing fields
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal server error
 */
export const updateItem = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, description, safetyInfo, approval } = req.body;

    try {
        const itemId = parseInt(id);
        if (isNaN(itemId)) {
            res.status(400).json({ error: 'Invalid item ID' });
            return;
        }

        const existingItem = await prisma.item.findUnique({
            where: { id: itemId },
        });

        if (!existingItem) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }

        const updatedItem = await prisma.item.update({
            where: { id: itemId },
            data: {
                name: name ?? existingItem.name,
                description: description ?? existingItem.description,
                safetyInfo: safetyInfo ?? existingItem.safetyInfo,
                approval: approval ?? existingItem.approval,
            },
        });

        res.status(200).json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/delete-item/{id}:
 *   delete:
 *     summary: Delete an inventory item
 *     description: Permanently deletes an item from the inventory
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the item to delete
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       400:
 *         description: Invalid item ID
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal server error
 */
export const deleteItem = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const itemId = parseInt(id);
        if (isNaN(itemId)) {
            res.status(400).json({ error: 'Invalid item ID' });
            return;
        }

        const existingItem = await prisma.item.findUnique({
            where: { id: itemId },
        });

        if (!existingItem) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }

        await prisma.item.delete({
            where: { id: itemId },
        });

        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};