import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { PERMISSIONS } from '../../config/permissions';

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
                                gte: PERMISSIONS.LAB_MANAGER,
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

/**
 * @swagger
 * /admin/lab/{id}:
 *   put:
 *     summary: Update lab details
 *     description: Updates the name, location, or status of a lab.
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name of the lab
 *               location:
 *                 type: string
 *                 description: New location of the lab
 *               status:
 *                 type: string
 *                 description: New status of the lab (e.g., active, inactive, under_maintenance)
 *     responses:
 *       200:
 *         description: Lab updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lab'
 *       400:
 *         description: Invalid lab ID or invalid input
 *       403:
 *         description: User not authorized to update this lab
 *       404:
 *         description: Lab not found
 *       500:
 *         description: Internal server error
 */
export const updateLab = async (req: Request, res: Response): Promise<void> => {
    const labId = parseInt(req.params.id);
    const { name, location, status } = req.body;

    if (isNaN(labId)) {
        res.status(400).json({ error: 'Invalid lab ID' });
        return;
    }

    try {
        // Check if lab exists
        const currentLab = await prisma.lab.findUnique({
            where: { id: labId },
        });

        if (!currentLab) {
            res.status(404).json({ error: 'Lab not found' });
            return;
        }

        // Build update data
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (location !== undefined) updateData.location = location;
        if (status !== undefined) updateData.status = status;

        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ error: 'No valid fields to update' });
            return;
        }

        const updatedLab = await prisma.lab.update({
            where: { id: labId },
            data: updateData,
        });

        res.status(200).json(updatedLab);
    } catch (error) {
        console.error('Error updating lab:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/lab/{id}:
 *   delete:
 *     summary: Delete a lab
 *     description: Permanently deletes a lab and all its associated data including members, inventory, discussions, events, etc.
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab to delete
 *     responses:
 *       200:
 *         description: Lab deleted successfully
 *       400:
 *         description: Invalid lab ID
 *       403:
 *         description: User not authorized to delete this lab
 *       404:
 *         description: Lab not found
 *       500:
 *         description: Internal server error
 */
export const deleteLab = async (req: Request, res: Response): Promise<void> => {
    const labId = parseInt(req.params.id);
    const sessionUserId = (req.session as any)?.passport?.user;

    if (isNaN(labId)) {
        res.status(400).json({ error: 'Invalid lab ID' });
        return;
    }

    if (!sessionUserId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }

    try {
        // Get current user and their global role
        const currentUser = await prisma.user.findUnique({
            where: { id: sessionUserId },
            include: { role: true },
        });

        if (!currentUser || !currentUser.role) {
            res.status(403).json({ error: 'User role not found or user not found.' });
            return;
        }

        let authorized = false;
        
        // Only allow Root Admins (permission level 100+) to delete labs
        if (currentUser.role.permissionLevel >= PERMISSIONS.GLOBAL_ADMIN) {
            authorized = true;
        }

        if (!authorized) {
            res.status(403).json({ error: 'Only administrators can delete labs' });
            return;
        }

        // Check if lab exists
        const labToDelete = await prisma.lab.findUnique({
            where: { id: labId },
            include: {
                labMembers: true,
                inventoryItems: true,
                discussions: true,
                events: true,
                LabAdmission: true,
                auditLogs: true,
            }
        });

        if (!labToDelete) {
            res.status(404).json({ error: 'Lab not found' });
            return;
        }

        // Perform the deletion using a transaction to ensure data consistency
        await prisma.$transaction(async (tx) => {
            // Set last viewed lab = null for users who have this lab as last viewed lab
            await tx.user.updateMany({
                where: { lastViewedLabId: labId },
                data: { lastViewedLabId: null }
            });

            // Delete lab admissions
            await tx.labAdmission.deleteMany({
                where: { labId: labId }
            });

            // Discussion deletions
            // Find all posts, replies for lab members
            const labMembersToDelete = await tx.labMember.findMany({
                where: { labId: labId },
                select: { id: true }
            });
            
            const labMemberIds = labMembersToDelete.map(member => member.id);

            // Delete all discussion replies by lab members in this lab
            await tx.discussionReply.deleteMany({
                where: { memberId: { in: labMemberIds } }
            });

            // Delete discussion post reactions by lab members in this lab
            await tx.discussionPostReaction.deleteMany({
                where: { memberId: { in: labMemberIds } }
            });

            // Delete discussion posts created by lab members
            await tx.discussionPost.deleteMany({
                where: { memberId: { in: labMemberIds } }
            });

            // Get all discussion posts in this lab's discussions (if any remain)
            const discussionPostsToDelete = await tx.discussionPost.findMany({
                where: { discussion: { labId: labId } },
                select: { id: true }
            });
            
            const discussionPostIds = discussionPostsToDelete.map(post => post.id);

            // Delete remaining discussion post reactions (from any member)
            if (discussionPostIds.length > 0) {
                await tx.discussionPostReaction.deleteMany({
                    where: { postId: { in: discussionPostIds } }
                });

                // Delete discussion post tags
                await tx.discussionPostTag.deleteMany({
                    where: { postId: { in: discussionPostIds } }
                });

                // Delete remaining discussion replies (from any member)
                await tx.discussionReply.deleteMany({
                    where: { postId: { in: discussionPostIds } }
                });

                // Delete discussion posts
                await tx.discussionPost.deleteMany({
                    where: { discussion: { labId: labId } }
                });
            }

            // Delete discussions
            await tx.discussion.deleteMany({
                where: { labId: labId }
            });

            // Event deletions
            // Delete event assignments for lab members
            await tx.eventAssignment.deleteMany({
                where: { memberId: { in: labMemberIds } }
            });

            // Get events in this lab and delete their assignments
            const eventsToDelete = await tx.event.findMany({
                where: { labId: labId },
                select: { id: true }
            });
            
            const eventIds = eventsToDelete.map(event => event.id);

            // Delete remaining event assignments (from any member)
            await tx.eventAssignment.deleteMany({
                where: { eventId: { in: eventIds } }
            });

            // Delete events
            await tx.event.deleteMany({
                where: { labId: labId }
            });


            // Inventory deletions
            // Get lab inventory items to handle their relationships
            const inventoryItemsToDelete = await tx.labInventoryItem.findMany({
                where: { labId: labId },
                select: { id: true }
            });
            
            const inventoryItemIds = inventoryItemsToDelete.map(item => item.id);

            // Delete lab item tags
            await tx.labItemTag.deleteMany({
                where: { inventoryItemId: { in: inventoryItemIds } }
            });

            // Update inventory logs to preserve them but remove the reference to deleted items
            await tx.inventoryLog.updateMany({
                where: { labInventoryItemId: { in: inventoryItemIds } },
                data: { labInventoryItemId: null }
            });

            // Delete lab inventory items
            await tx.labInventoryItem.deleteMany({
                where: { labId: labId }
            });

            // Member deletions
            // Delete member statuses
            await tx.memberStatus.deleteMany({
                where: { memberId: { in: labMemberIds } }
            });

            // Delete lab attendance records
            await tx.labAttendance.deleteMany({
                where: { memberId: { in: labMemberIds } }
            });

            // Update inventory logs to remove member references (preserve logs but make reference null)
            await tx.inventoryLog.updateMany({
                where: { memberId: { in: labMemberIds } },
                data: { memberId: null }
            });

            // Delete lab members
            await tx.labMember.deleteMany({
                where: { labId: labId }
            });

            // Audit cleanup
            // Delete audit log details (audit not currently implemented, just putting for future referenc)
            await tx.auditDetail.deleteMany({
                where: { auditLog: { labId: labId } }
            });
            
            // Delete audit logs related to this lab
            await tx.auditLog.deleteMany({
                where: { labId: labId }
            });

            // Finally delete the lab
            await tx.lab.delete({
                where: { id: labId }
            });
        });

        res.status(200).json({ 
            message: 'Lab deleted successfully',
            deletedLabId: labId,
            deletedLabName: labToDelete.name
        });

    } catch (error) {
        console.error('Error deleting lab:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                res.status(404).json({ error: 'Lab not found during deletion' });
                return;
            }
        }
        res.status(500).json({ error: 'Internal server error while deleting lab' });
    }
};

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
        const result = await prisma.$transaction(async (tx) => {
            // Create the lab
            const newLab = await tx.lab.create({
                data: {
                    name,
                    location,
                    status: 'active',
                },
            });

            // Create default discussion categories (Announcements, General)
            await tx.discussion.createMany({
                data: [
                    {
                        labId: newLab.id,
                        name: 'Announcements',
                        description: 'Important announcements and updates for the lab',
                    },
                    {
                        labId: newLab.id,
                        name: 'General',
                        description: 'General discussion and conversation for lab members',
                    }
                ]
            });

            return newLab;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating lab:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}