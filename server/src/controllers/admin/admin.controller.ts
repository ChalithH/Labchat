import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { hashPassword } from '../../utils/hashing.util';

const prisma = new PrismaClient();

/**
 * @swagger
 * /admin/get-labs:
 *   get:
 *     summary: Get all labs with their managers
 *     description: Retrieves a list of all labs in the system with their associated managers
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of labs with managers fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID of the lab
 *                   name:
 *                     type: string
 *                     description: Name of the lab
 *                   location:
 *                     type: string
 *                     description: Location of the lab
 *                   status:
 *                     type: string
 *                     description: Status of the lab
 *                   managers:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: User ID of the manager
 *                         name:
 *                           type: string
 *                           description: Display name of the manager
 *                         role:
 *                           type: string
 *                           description: Role of the manager in the lab
 *       500:
 *         description: Internal server error
 */
export const getAllLabs = async (req: Request, res: Response): Promise<void> => {
    try {
        const labs = await prisma.lab.findMany({
            include: {
                labMembers: {
                    where: {
                        labRole: {
                            permissionLevel: {
                                gte: 70,  // Only managers with role permission >= 70
                            },
                        }
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                displayName: true
                            }
                        },
                        labRole: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        // Format the response to include managers in a cleaner way
        const formattedLabs = labs.map(lab => ({
            id: lab.id,
            name: lab.name,
            location: lab.location,
            status: lab.status,
            managers: lab.labMembers.map(member => ({
                id: member.user.id,
                name: member.user.displayName,
                role: member.labRole.name
            }))
        }));

        res.status(200).json(formattedLabs);
    } catch (error) {
        console.error('Error fetching labs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * @swagger
 * /admin/get-lab/{id}:
 *   get:
 *     summary: Get a lab by ID
 *     description: Retrieves details of a lab by its ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab to fetch
 *     responses:
 *       200:
 *         description: Lab details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the lab
 *                 name:
 *                   type: string
 *                   description: Name of the lab
 *                 location:
 *                   type: string
 *                   description: Location of the lab
 *       400:
 *         description: Invalid lab ID
 *       404:
 *         description: Lab not found
 *       500:
 *         description: Internal server error
 */

export const getLabById = async (req: Request, res: Response): Promise<void> => {
    const labId = parseInt(req.params.id);
    if (isNaN(labId)) {
        res.status(400).json({ error: 'Invalid lab ID' });
    }
    try {
        const lab = await prisma.lab.findUnique({
            where: { id: labId }
        });
        if (!lab) {
            res.status(404).json({ error: 'Lab not found' });
        }
        res.status(200).json(lab);
    } catch (error) {
        console.error('Error fetching lab:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Admin:

/**
 * @swagger
 * /admin/create-lab:
 *   post:
 *     summary: Create a new lab
 *     description: Adds a new lab to the system
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the lab
 *               location:
 *                 type: string
 *                 description: Location of the lab
 *     responses:
 *       201:
 *         description: Lab created successfully
 *       500:
 *         description: Internal server error
 */

export const createLab = async (req: Request, res: Response): Promise<void> => {
    const { name, location } = req.body;
    try {
        const newLab = await prisma.lab.create({
            data: {
                name,
                location,
                status: 'active',
            },
        });
        res.status(201).json(newLab);
    } catch (error) {
        console.error('Error creating lab:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * @swagger
 * /admin/assign-user:
 *   post:
 *     summary: Assign a user to a lab
 *     description: Adds an existing user to a lab with a specific role (regular or manager)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - labId
 *               - userId
 *               - role
 *             properties:
 *               labId:
 *                 type: integer
 *                 description: ID of the lab
 *               userId:
 *                 type: integer
 *                 description: ID of the user to be assigned
 *               role:
 *                 type: string
 *                 description: Role assigned to the user (e.g., "regular", "manager")
 *     responses:
 *       201:
 *         description: User assigned to lab successfully
 *       404:
 *         description: Lab not found or User does not exist
 *       409:
 *         description: User already in the lab
 *       500:
 *         description: Internal server error
 */

export const assignUserToLab = async (req: Request, res: Response): Promise<void> => {
    const { labId, userId, role } = req.body;
    try {
        const lab = await prisma.lab.findUnique({
            where: { id: labId }
        });
        if (!lab) {
            res.status(404).json({ error: 'Lab not found' });
        }
        const userExists = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (userExists) {
            res.status(400).json({ error: 'User does not exist' });
        }

        const userInLab = await prisma.labMember.findFirst({
            where: {
                labId: labId,
                userId: userId
            }
        });

        if (userInLab) {
            res.status(409).json({ error: 'User already in lab' });
        }

        const labMember = await prisma.labMember.create({
            data: {
                labId,
                userId,
                labRoleId: role,
            }
        });
        res.status(201).json(labMember);

    } catch (error) {
        console.error('Error assigning user to lab:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * @swagger
 * /admin/update-role:
 *   put:
 *     summary: Change a user's role in a lab
 *     description: Promotes or changes a user's role in an existing lab
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - labId
 *               - userId
 *               - role
 *             properties:
 *               labId:
 *                 type: integer
 *                 description: ID of the lab
 *               userId:
 *                 type: integer
 *                 description: ID of the user
 *               role:
 *                 type: integer
 *                 description: New role for the user (e.g., "regular", "manager")
 *     responses:
 *       201:
 *         description: User role updated successfully
 *       404:
 *         description: Lab not found or User not in lab
 *       500:
 *         description: Internal server error
 */

export const updateRole = async (req: Request, res: Response): Promise<void> => {
    const { labId, userId, role } = req.body;
    try {
        const lab = await prisma.lab.findUnique({
            where: { id: labId }
        });
        if (!lab) {
            res.status(404).json({ error: 'Lab not found' });
        }
        const userExists = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (userExists) {
            res.status(404).json({ error: 'User does not exist' });
        }

        const userInLab = await prisma.labMember.findFirst({
            where: {
                labId: labId,
                userId: userId
            }
        });

        if (!userInLab) {
            res.status(404).json({ error: 'User not in lab' });
            throw new Error('User not in lab');
        }

        const labMember = await prisma.labMember.update({
            where: {
                id: userInLab.id
            },
            data: {
                labRoleId: role,
            }
        });
        res.status(201).json(labMember);
    } catch (error) {
        console.error('Error promoting lab manager:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * @swagger
 * /admin/reset-password:
 *   put:
 *     summary: Reset a user's password
 *     description: Allows resetting a user's password
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - newPassword
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user
 *               newPassword:
 *                 type: string
 *                 description: New password for the user
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

export const resetUserPassword = async (req: Request, res: Response): Promise<void> => {
    const { userId, newPassword } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                loginPassword: await hashPassword(newPassword)
            }
        });
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error resetting user password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Lab Managers:

/**
 * @swagger
 * /admin/remove-user:
 *   post:
 *     summary: Remove a user from a lab
 *     description: Removes an existing user from a lab
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - labId
 *               - userId
 *             properties:
 *               labId:
 *                 type: integer
 *                 description: ID of the lab
 *               userId:
 *                 type: integer
 *                 description: ID of the user to be removed
 *     responses:
 *       200:
 *         description: User removed from lab
 *       404:
 *         description: Lab or User not found
 *       500:
 *         description: Internal server error
 */

export const removeUserFromLab = async (req: Request, res: Response): Promise<void> => {
    const { labId, userId } = req.body;
    try {
        const lab = await prisma.lab.findUnique({
            where: { id: labId }
        });
        if (!lab) {
            res.status(404).json({ error: 'Lab not found' });
        }
        const userInLab = await prisma.labMember.findFirst({
            where: {
                labId: labId,
                userId: userId
            }
        });

        if (!userInLab) {
            res.status(404).json({ error: 'User not in lab' });
            throw new Error('User not in lab');
        }

        await prisma.labMember.delete({
            where: {
                id: userInLab.id
            }
        });
        res.status(200).json({ message: 'User removed from lab' });
    } catch (error) {
        console.error('Error removing user from lab:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * @swagger
 * /admin/create-discussion-tag:
 *   post:
 *     summary: Create a new discussion tag
 *     description: Adds a new tag for discussions
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tag
 *             properties:
 *               tag:
 *                 type: string
 *                 description: Name of the tag
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Optional description of the tag
 *     responses:
 *       201:
 *         description: Tag created successfully
 *       500:
 *         description: Internal server error
 */

export const createDiscussionTag = async (req: Request, res: Response): Promise<void> => {
    const { tag, description } = req.body;
    try {
        const newTag = await prisma.postTag.create({
            data: {
                tag,
                description,
            },
        });
        res.status(201).json(newTag);
    } catch (error) {
        console.error('Error creating discussion tag:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * @swagger
 * /admin/create-discussion-category:
 *   post:
 *     summary: Create a new discussion category
 *     description: Adds a new category for discussions
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - labId
 *               - name
 *             properties:
 *               labId:
 *                 type: integer
 *                 description: ID of the lab
 *               name:
 *                 type: string
 *                 description: Name of the discussion category
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Optional description of the category
 *     responses:
 *       201:
 *         description: Category created successfully
 *       404:
 *         description: Lab not found
 *       500:
 *         description: Internal server error
 */

export const createDiscussionCategory = async (req: Request, res: Response): Promise<void> => {
    const { labId, name, description } = req.body;

    try {
        const lab = await prisma.lab.findUnique({
            where: { id: labId }
        });
        if (!lab) {
            res.status(404).json({ error: 'Lab not found' });
        }

        const newCategory = await prisma.discussion.create({
            data: {
                labId,
                name,
                description,
            },
        });
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating discussion category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * @swagger
 * /admin/create-inventory-tag:
 *   post:
 *     summary: Create a new inventory tag
 *     description: Adds a new tag for inventory items
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
 *                 description: Name of the tag
 *               tagDescription:
 *                 type: string
 *                 nullable: true
 *                 description: Optional description of the tag
 *     responses:
 *       201:
 *         description: Tag created successfully
 *       500:
 *         description: Internal server error
 */

export const createInventoryTag = async (req: Request, res: Response): Promise<void> => {
    const { name, tagDescription } = req.body;
    try {
        const newTag = await prisma.itemTag.create({
            data: {
                name,
                tagDescription,
            },
        });
        res.status(201).json(newTag);
    } catch (error) {
        console.error('Error creating inventory tag:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * @swagger
 * /admin/create-inventory-item:
 *   post:
 *     summary: Create a new inventory item
 *     description: Adds a new item to the lab's inventory
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *               - labId
 *               - location
 *               - itemUnit
 *               - currentStock
 *               - minStock
 *             properties:
 *               itemId:
 *                 type: integer
 *                 description: ID of the item being added
 *               labId:
 *                 type: integer
 *                 description: ID of the lab to which the item is being added
 *               location:
 *                 type: string
 *                 description: Location of the item within the lab
 *               itemUnit:
 *                 type: string
 *                 description: Unit of the item (e.g., "kg", "liters")
 *               currentStock:
 *                 type: integer
 *                 description: Current stock level of the item
 *               minStock:
 *                 type: integer
 *                 description: Minimum stock level to trigger restocking
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 *       500:
 *         description: Internal server error
 */

export const createInventoryItem = async (req: Request, res: Response): Promise<void> => {
    const { itemId, labId, location, itemUnit, currentStock, minStock, name, description, safetyInfo } = req.body;
    try {
        const newItem = await prisma.labInventoryItem.create({
            data: {
                itemId,
                labId,
                location,
                itemUnit,
                currentStock,
                minStock
            },
        });

        const inventoryItem = await prisma.item.create({
            data: {
                name,
                description,
                safetyInfo,
            }
        });
        res.status(201).json(newItem).json(inventoryItem);
    } catch (error) {
        console.error('Error creating inventory item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}



// Inventory related endpoints
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

// Inventory related endpoints
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
                id: undefined, // Prisma will auto-generate the ID
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