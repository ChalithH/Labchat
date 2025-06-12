import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    const { labId, name, description, postPermission, visiblePermission } = req.body;
    const userId = (req.session as any)?.passport?.user;

    try {
        const lab = await prisma.lab.findUnique({
            where: { id: labId }
        });
        if (!lab) {
            res.status(404).json({ error: 'Lab not found' });
            return;
        }

        // Permission check handled by middleware

        // Prevent duplicates
        const existingCategory = await prisma.discussion.findFirst({
            where: {
                labId: labId,
                name: {
                    equals: name.trim(),
                    mode: 'insensitive'
                }
            }
        });

        if (existingCategory) {
            res.status(400).json({ error: `A category named '${name}' already exists in this lab` });
            return;
        }

        const newCategory = await prisma.discussion.create({
            data: {
                labId,
                name: name.trim(),
                description,
                postPermission: postPermission || null,
                visiblePermission: visiblePermission || null,
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
 * /admin/lab/{labId}/update-discussion/{discussionId}:
 *   put:
 *     summary: Update a discussion category
 *     description: Updates an existing discussion category for a lab. For default categories (Announcements, General), the name cannot be changed.
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab
 *       - in: path
 *         name: discussionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the discussion category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the discussion category (cannot be changed for Announcements/General)
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Optional description of the category
 *               postPermission:
 *                 type: integer
 *                 nullable: true
 *                 description: Permission level required to post in this category
 *               visiblePermission:
 *                 type: integer
 *                 nullable: true
 *                 description: Permission level required to view this category
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid input or attempting to rename protected category
 *       404:
 *         description: Lab or discussion not found
 *       500:
 *         description: Internal server error
 */
export const updateDiscussionCategory = async (req: Request, res: Response): Promise<void> => {
    const { labId, discussionId } = req.params;
    const { name, description, postPermission, visiblePermission } = req.body;
    
    const labIdInt = parseInt(labId);
    const discussionIdInt = parseInt(discussionId);
    
    if (isNaN(labIdInt) || isNaN(discussionIdInt)) {
        res.status(400).json({ error: 'Invalid lab ID or discussion ID' });
        return;
    }

    try {
        // Verify the discussion exists and belongs to the lab
        const existingDiscussion = await prisma.discussion.findFirst({
            where: { 
                id: discussionIdInt,
                labId: labIdInt 
            }
        });

        if (!existingDiscussion) {
            res.status(404).json({ error: 'Discussion category not found in this lab' });
            return;
        }

        // Check if trying to rename protected (default) categories
        const protectedNames = ['Announcements', 'General'];
        if (protectedNames.includes(existingDiscussion.name) && name && name !== existingDiscussion.name) {
            res.status(400).json({ 
                error: `Cannot rename the '${existingDiscussion.name}' category as it is a system default.` 
            });
            return;
        }

        // Prevent renaming to existing category (prevent duplicates)
        if (name && name.trim().toLowerCase() !== existingDiscussion.name.toLowerCase()) {
            const duplicateCategory = await prisma.discussion.findFirst({
                where: {
                    labId: labIdInt,
                    name: {
                        equals: name.trim(),
                        mode: 'insensitive'
                    },
                    id: { not: discussionIdInt } // Exclude current category
                }
            });

            if (duplicateCategory) {
                res.status(400).json({ 
                    error: `A category named '${name}' already exists in this lab` 
                });
                return;
            }
        }

        // Build update data
        const updateData: any = {};
        if (name !== undefined && !protectedNames.includes(existingDiscussion.name)) {
            updateData.name = name.trim();
        }
        if (description !== undefined) updateData.description = description;
        if (postPermission !== undefined) updateData.postPermission = postPermission;
        if (visiblePermission !== undefined) updateData.visiblePermission = visiblePermission;

        const updatedDiscussion = await prisma.discussion.update({
            where: { id: discussionIdInt },
            data: updateData
        });

        res.status(200).json(updatedDiscussion);
    } catch (error) {
        console.error('Error updating discussion category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}