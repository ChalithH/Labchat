import { Request, Response } from 'express';
import { PrismaClient, InventorySource } from '@prisma/client';
import { 
  logItemAdded, 
  logItemRemoved, 
  logStockUpdate, 
  logLocationChange, 
  logMinStockUpdate,
  logItemUpdate, 
  getInventoryLogsForLab,
  getUserAndMemberIdFromRequest
} from '../../utils/inventoryLogging.util';

const prisma = new PrismaClient();

/**
 * @swagger
 * /admin/lab/{labId}/inventory:
 *   post:
 *     summary: Add a global item to a lab's inventory
 *     description: Creates a new lab inventory item by adding a global item to a specific lab
 *     tags: [Admin, Inventory]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab to add the item to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *               - location
 *               - itemUnit
 *               - currentStock
 *               - minStock
 *             properties:
 *               itemId:
 *                 type: integer
 *                 description: ID of the global item to add
 *               location:
 *                 type: string
 *                 description: Location within the lab
 *               itemUnit:
 *                 type: string
 *                 description: Unit of measurement
 *               currentStock:
 *                 type: integer
 *                 description: Current stock amount
 *               minStock:
 *                 type: integer
 *                 description: Minimum stock threshold
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of tag IDs to assign to this item
 *     responses:
 *       201:
 *         description: Item added to lab inventory successfully
 *       400:
 *         description: Invalid input or item already in lab
 *       404:
 *         description: Lab or item not found
 *       500:
 *         description: Internal server error
 */
export const addItemToLab = async (req: Request, res: Response): Promise<void> => {
    const labId = parseInt(req.params.labId);
    const { itemId, location, itemUnit, currentStock, minStock, tagIds } = req.body;

    if (isNaN(labId)) {
        res.status(400).json({ error: 'Invalid lab ID' });
        return;
    }

    // Permission check handled by middleware

    if (!itemId || !location || !itemUnit || currentStock === undefined || minStock === undefined) {
        res.status(400).json({ error: 'All fields are required: itemId, location, itemUnit, currentStock, minStock' });
        return;
    }

    try {
        // Verify the lab exists
        const lab = await prisma.lab.findUnique({
            where: { id: labId }
        });

        if (!lab) {
            res.status(404).json({ error: 'Lab not found' });
            return;
        }

        // Verify the item exists
        const item = await prisma.item.findUnique({
            where: { id: parseInt(itemId) }
        });

        if (!item) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }

        // Check if item is already in this lab
        const existingLabItem = await prisma.labInventoryItem.findFirst({
            where: { itemId: parseInt(itemId), labId }
        });

        if (existingLabItem) {
            res.status(400).json({ error: 'Item already exists in this lab' });
            return;
        }

        // Create the lab inventory item
        const newLabItem = await prisma.labInventoryItem.create({
            data: {
                itemId: parseInt(itemId),
                labId,
                location,
                itemUnit,
                currentStock: parseInt(currentStock),
                minStock: parseInt(minStock)
            }
        });

        // Handle tags if provided
        if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
            // Verify all tags exist
            const tags = await prisma.itemTag.findMany({
                where: { id: { in: tagIds.map((id: any) => parseInt(id)) } }
            });

            if (tags.length !== tagIds.length) {
                // Clean up the created item if tags are invalid
                await prisma.labInventoryItem.delete({ where: { id: newLabItem.id } });
                res.status(400).json({ error: 'One or more tags not found' });
                return;
            }

            // Add tags
            await prisma.labItemTag.createMany({
                data: tagIds.map((tagId: any) => ({
                    inventoryItemId: newLabItem.id,
                    itemTagId: parseInt(tagId)
                }))
            });
        }

        // Get complete item with relations
        const completeItem = await prisma.labInventoryItem.findUnique({
            where: { id: newLabItem.id },
            include: {
                item: true,
                labItemTags: {
                    include: { itemTag: true }
                }
            }
        });

        // Log the item addition
        const userId = (req.session as any)?.passport?.user;
        if (userId) {
            await logItemAdded(
                newLabItem.id,
                userId,
                {
                    itemId: newLabItem.itemId,
                    itemName: item.name,
                    location: newLabItem.location,
                    itemUnit: newLabItem.itemUnit,
                    currentStock: newLabItem.currentStock,
                    minStock: newLabItem.minStock,
                    labId: labId 
                },
                'ADMIN_PANEL',
                'Item added to lab via admin panel',
                null // memberId not needed for admin operations
            );
        }

        res.status(201).json(completeItem);
    } catch (error) {
        console.error('Error adding item to lab:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/lab/{labId}/inventory/{itemId}:
 *   put:
 *     summary: Update a lab inventory item
 *     description: Updates the details of an existing lab inventory item
 *     tags: [Admin, Inventory]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab inventory item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: string
 *               itemUnit:
 *                 type: string
 *               currentStock:
 *                 type: integer
 *               minStock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Lab inventory item updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Lab or item not found
 *       500:
 *         description: Internal server error
 */
export const updateLabInventoryItem = async (req: Request, res: Response): Promise<void> => {
    const labId = parseInt(req.params.labId);
    const itemId = parseInt(req.params.itemId);
    const { location, itemUnit, currentStock, minStock } = req.body;

    if (isNaN(labId) || isNaN(itemId)) {
        res.status(400).json({ error: 'Invalid lab ID or item ID' });
        return;
    }

    try {
        // Find the lab inventory item
        const existingItem = await prisma.labInventoryItem.findFirst({
            where: { id: itemId, labId },
            include: {
                item: true,
                labItemTags: {
                    include: { itemTag: true }
                }
            }
        });

        if (!existingItem) {
            res.status(404).json({ error: 'Lab inventory item not found' });
            return;
        }

        // Update the item
        const updatedItem = await prisma.labInventoryItem.update({
            where: { id: itemId },
            data: {
                location: location ?? existingItem.location,
                itemUnit: itemUnit ?? existingItem.itemUnit,
                currentStock: currentStock !== undefined ? parseInt(currentStock) : existingItem.currentStock,
                minStock: minStock !== undefined ? parseInt(minStock) : existingItem.minStock,
                updatedAt: new Date()
            },
            include: {
                item: true,
                labItemTags: {
                    include: { itemTag: true }
                }
            }
        });

        // Log the changes
        const { userId, memberId } = await getUserAndMemberIdFromRequest(req, labId);
        if (userId) {
            // Log location change
            if (location !== undefined && location !== existingItem.location) {
                await logLocationChange(
                    itemId,
                    userId,
                    existingItem.location,
                    location,
                    InventorySource.ADMIN_PANEL,
                    `Location changed via admin panel`,
                    memberId
                );
            }

            // Log current stock change (manual correction)
            if (currentStock !== undefined && parseInt(currentStock) !== existingItem.currentStock) {
                await logStockUpdate(
                    itemId,
                    userId,
                    existingItem.currentStock,
                    parseInt(currentStock),
                    InventorySource.ADMIN_PANEL,
                    `Stock manually updated via admin panel`,
                    memberId
                );
            }

            // Log minimum stock change
            if (minStock !== undefined && parseInt(minStock) !== existingItem.minStock) {
                await logMinStockUpdate(
                    itemId,
                    userId,
                    existingItem.minStock,
                    parseInt(minStock),
                    InventorySource.ADMIN_PANEL,
                    `Minimum stock threshold updated via admin panel`,
                    memberId
                );
            }

            // Log other property changes (itemUnit)
            if (itemUnit !== undefined && itemUnit !== existingItem.itemUnit) {
                await logItemUpdate(
                    itemId,
                    userId,
                    { itemUnit: existingItem.itemUnit },
                    { itemUnit: itemUnit },
                    InventorySource.ADMIN_PANEL,
                    `Item unit updated via admin panel`,
                    memberId
                );
            }
        }

        res.status(200).json(updatedItem);
    } catch (error) {
        console.error('Error updating lab inventory item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/lab/{labId}/inventory/{itemId}:
 *   delete:
 *     summary: Remove an item from lab inventory
 *     description: Removes a lab inventory item and all its associated tags
 *     tags: [Admin, Inventory]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab inventory item
 *     responses:
 *       200:
 *         description: Item removed from lab inventory successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Lab or item not found
 *       500:
 *         description: Internal server error
 */
export const removeItemFromLab = async (req: Request, res: Response): Promise<void> => {
    const labId = parseInt(req.params.labId);
    const itemId = parseInt(req.params.itemId);

    if (isNaN(labId) || isNaN(itemId)) {
        res.status(400).json({ error: 'Invalid lab ID or item ID' });
        return;
    }

    // Permission check handled by middleware

    try {
        // Find the lab inventory item
        const existingItem = await prisma.labInventoryItem.findFirst({
            where: { id: itemId, labId },
            include: {
                item: true,
                labItemTags: {
                    include: { itemTag: true }
                }
            }
        });

        if (!existingItem) {
            res.status(404).json({ error: 'Lab inventory item not found' });
            return;
        }

        // Log the item removal before deletion
        const userId = (req.session as any)?.passport?.user;
        if (userId) {
            await logItemRemoved(
                itemId,
                userId,
                {
                    itemId: existingItem.itemId,
                    itemName: existingItem.item.name,
                    location: existingItem.location,
                    itemUnit: existingItem.itemUnit,
                    currentStock: existingItem.currentStock,
                    minStock: existingItem.minStock,
                    labId: labId,  
                    item: {        // Include full item info for frontend display
                        id: existingItem.item.id,
                        name: existingItem.item.name,
                        description: existingItem.item.description
                    }
                },
                'ADMIN_PANEL',
                'Item removed from lab via admin panel',
                null // memberId not needed for admin operations
            );
        }

        // Delete the item + tags
        await prisma.labInventoryItem.delete({
            where: { id: itemId }
        });

        res.status(200).json({ message: 'Item removed from lab inventory successfully' });
    } catch (error) {
        console.error('Error removing item from lab:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/lab/{labId}/inventory-logs:
 *   get:
 *     summary: Get inventory logs for a specific lab
 *     description: Retrieves filtered and paginated inventory logs for a lab with detailed information
 *     tags: [Admin, Inventory]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of logs to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of logs to skip
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [STOCK_ADD, STOCK_REMOVE, STOCK_UPDATE, LOCATION_CHANGE, MIN_STOCK_UPDATE, ITEM_ADDED, ITEM_REMOVED, ITEM_UPDATE]
 *         description: Filter by action type
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [ADMIN_PANEL, LAB_INTERFACE, API_DIRECT, BULK_IMPORT]
 *         description: Filter by source
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs until this date
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: memberId
 *         schema:
 *           type: integer
 *         description: Filter by lab member ID
 *     responses:
 *       200:
 *         description: Inventory logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                 totalCount:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 hasNextPage:
 *                   type: boolean
 *                 hasPrevPage:
 *                   type: boolean
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
export const getLabInventoryLogs = async (req: Request, res: Response): Promise<void> => {
    const labId = parseInt(req.params.labId);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (isNaN(labId)) {
        res.status(400).json({ error: 'Invalid lab ID' });
        return;
    }

    try {
        // Parse optional filter parameters
        const filters: any = {};
        
        if (req.query.action) {
            filters.action = req.query.action as string;
        }
        
        if (req.query.source) {
            filters.source = req.query.source as string;
        }
        
        if (req.query.startDate) {
            filters.startDate = new Date(req.query.startDate as string);
        }
        
        if (req.query.endDate) {
            filters.endDate = new Date(req.query.endDate as string);
        }
        
        if (req.query.userId) {
            filters.userId = parseInt(req.query.userId as string);
        }
        
        if (req.query.memberId) {
            filters.memberId = parseInt(req.query.memberId as string);
        }

        const result = await getInventoryLogsForLab(labId, {
            limit,
            offset,
            ...filters
        });
        
        res.status(200).json(result);
    } catch (error) {
        console.error('Error retrieving inventory logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};