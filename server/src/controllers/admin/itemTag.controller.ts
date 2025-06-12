import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PERMISSIONS } from '../../config/permissions';

const prisma = new PrismaClient();

/**
 * @swagger
 * /admin/tags:
 *   post:
 *     summary: Create a new global tag
 *     description: Creates a new global tag that can be used across all labs
 *     tags: [Admin, Tags]
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
 *                 description: Description of the tag
 *     responses:
 *       201:
 *         description: Tag created successfully
 *       400:
 *         description: Invalid input or tag already exists
 *       500:
 *         description: Internal server error
 */
export const createTag = async (req: Request, res: Response): Promise<void> => {
    const { name, tagDescription } = req.body;
    const sessionUserId = (req.session as any)?.passport?.user;

    if (!name || typeof name !== 'string') {
        res.status(400).json({ error: 'Tag name is required and must be a string' });
        return;
    }

    try {
        // Check if user has permission to create tags
        // Either they need global permission level 60+ OR be a lab manager in any lab
        const user = await prisma.user.findUnique({
            where: { id: sessionUserId },
            include: { 
                role: true,
                labMembers: {
                    include: {
                        labRole: true
                    }
                }
            }
        });

        if (!user || !user.role) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        // Check if user has global admin permission
        const hasGlobalPermission = user.role.permissionLevel >= PERMISSIONS.GLOBAL_ADMIN;
        
        // Check if user is a lab manager in any lab
        const isLabManager = user.labMembers.some(member => 
            member.labRole.permissionLevel >= PERMISSIONS.LAB_MANAGER
        );

        if (!hasGlobalPermission && !isLabManager) {
            res.status(403).json({ 
                error: 'Insufficient permissions. You must be a lab manager or have administrative privileges to create tags.' 
            });
            return;
        }

        // Check if tag with this name already exists
        const existingTag = await prisma.itemTag.findFirst({
            where: { name: { equals: name, mode: 'insensitive' } }
        });

        if (existingTag) {
            res.status(400).json({ error: 'Tag with this name already exists' });
            return;
        }

        const newTag = await prisma.itemTag.create({
            data: {
                name: name.trim(),
                tagDescription: tagDescription || null
            }
        });

        res.status(201).json(newTag);
    } catch (error) {
        console.error('Error creating tag:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/tags/{tagId}:
 *   put:
 *     summary: Update an existing tag
 *     description: Updates a global tag's name or description (admin only)
 *     tags: [Admin, Tags]
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the tag to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the tag
 *               tagDescription:
 *                 type: string
 *                 description: New description for the tag
 *     responses:
 *       200:
 *         description: Tag updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Internal server error
 */
export const updateTag = async (req: Request, res: Response): Promise<void> => {
    const tagId = parseInt(req.params.tagId);
    const { name, tagDescription } = req.body;

    if (isNaN(tagId)) {
        res.status(400).json({ error: 'Invalid tag ID' });
        return;
    }

    try {
        const existingTag = await prisma.itemTag.findUnique({
            where: { id: tagId }
        });

        if (!existingTag) {
            res.status(404).json({ error: 'Tag not found' });
            return;
        }

        // Check if another tag with the new name exists
        if (name && name !== existingTag.name) {
            const duplicateTag = await prisma.itemTag.findFirst({
                where: { 
                    name: { equals: name, mode: 'insensitive' },
                    id: { not: tagId }
                }
            });

            if (duplicateTag) {
                res.status(400).json({ error: 'Tag with this name already exists' });
                return;
            }
        }

        const updatedTag = await prisma.itemTag.update({
            where: { id: tagId },
            data: {
                name: name ? name.trim() : existingTag.name,
                tagDescription: tagDescription !== undefined ? tagDescription : existingTag.tagDescription
            }
        });

        res.status(200).json(updatedTag);
    } catch (error) {
        console.error('Error updating tag:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/tags/{tagId}:
 *   delete:
 *     summary: Delete a tag
 *     description: Deletes a global tag and removes all its assignments (admin only, use with caution)
 *     tags: [Admin, Tags]
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the tag to delete
 *     responses:
 *       200:
 *         description: Tag deleted successfully
 *       400:
 *         description: Invalid tag ID
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Internal server error
 */
export const deleteTag = async (req: Request, res: Response): Promise<void> => {
    const tagId = parseInt(req.params.tagId);

    if (isNaN(tagId)) {
        res.status(400).json({ error: 'Invalid tag ID' });
        return;
    }

    try {
        const existingTag = await prisma.itemTag.findUnique({
            where: { id: tagId },
            include: {
                labItemTags: true
            }
        });

        if (!existingTag) {
            res.status(404).json({ error: 'Tag not found' });
            return;
        }

        // Delete the tag
        await prisma.itemTag.delete({
            where: { id: tagId }
        });

        res.status(200).json({ 
            message: 'Tag deleted successfully',
            affectedLabItems: existingTag.labItemTags.length
        });
    } catch (error) {
        console.error('Error deleting tag:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/lab/{labId}/inventory/{itemId}/tags:
 *   post:
 *     summary: Add tags to a lab inventory item
 *     description: Adds one or more tags to an existing lab inventory item
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
 *             required:
 *               - tagIds
 *             properties:
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of tag IDs to add
 *     responses:
 *       200:
 *         description: Tags added successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Lab, item, or tags not found
 *       500:
 *         description: Internal server error
 */
export const addTagsToLabItem = async (req: Request, res: Response): Promise<void> => {
    const labId = parseInt(req.params.labId);
    const itemId = parseInt(req.params.itemId);
    const { tagIds } = req.body;

    if (isNaN(labId) || isNaN(itemId)) {
        res.status(400).json({ error: 'Invalid lab ID or item ID' });
        return;
    }

    if (!Array.isArray(tagIds) || tagIds.length === 0) {
        res.status(400).json({ error: 'tagIds must be a non-empty array' });
        return;
    }

    try {
        // Verify lab inventory item exists
        const labItem = await prisma.labInventoryItem.findFirst({
            where: { id: itemId, labId }
        });

        if (!labItem) {
            res.status(404).json({ error: 'Lab inventory item not found' });
            return;
        }

        // Check which tags already exist on this item
        const existingTags = await prisma.labItemTag.findMany({
            where: { inventoryItemId: itemId }
        });
        const existingTagIds = existingTags.map(tag => tag.itemTagId);

        // Filter out tags that already exist
        const newTagIds = tagIds.filter((tagId: number) => !existingTagIds.includes(tagId));

        if (newTagIds.length === 0) {
            res.status(400).json({ error: 'All specified tags are already assigned to this item' });
            return;
        }

        // Verify all tags exist
        const tags = await prisma.itemTag.findMany({
            where: { id: { in: newTagIds } }
        });

        if (tags.length !== newTagIds.length) {
            res.status(404).json({ error: 'One or more tags not found' });
            return;
        }

        // Add the tags
        await prisma.labItemTag.createMany({
            data: newTagIds.map((tagId: number) => ({
                inventoryItemId: itemId,
                itemTagId: tagId
            }))
        });

        res.status(200).json({ message: 'Tags added successfully' });
    } catch (error) {
        console.error('Error adding tags to lab item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/lab/{labId}/inventory/{itemId}/tags/{tagId}:
 *   delete:
 *     summary: Remove a tag from a lab inventory item
 *     description: Removes a specific tag from a lab inventory item
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
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the tag to remove
 *     responses:
 *       200:
 *         description: Tag removed successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Lab, item, or tag assignment not found
 *       500:
 *         description: Internal server error
 */
export const removeTagFromLabItem = async (req: Request, res: Response): Promise<void> => {
    const labId = parseInt(req.params.labId);
    const itemId = parseInt(req.params.itemId);
    const tagId = parseInt(req.params.tagId);

    if (isNaN(labId) || isNaN(itemId) || isNaN(tagId)) {
        res.status(400).json({ error: 'Invalid lab ID, item ID, or tag ID' });
        return;
    }

    try {
        // Verify lab inventory item exists
        const labItem = await prisma.labInventoryItem.findFirst({
            where: { id: itemId, labId }
        });

        if (!labItem) {
            res.status(404).json({ error: 'Lab inventory item not found' });
            return;
        }

        // Find and delete the tag assignment
        const tagAssignment = await prisma.labItemTag.findFirst({
            where: { inventoryItemId: itemId, itemTagId: tagId }
        });

        if (!tagAssignment) {
            res.status(404).json({ error: 'Tag assignment not found' });
            return;
        }

        await prisma.labItemTag.delete({
            where: { id: tagAssignment.id }
        });

        res.status(200).json({ message: 'Tag removed successfully' });
    } catch (error) {
        console.error('Error removing tag from lab item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};