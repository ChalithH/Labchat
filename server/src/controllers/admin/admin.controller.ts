import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { hashPassword } from '../../utils/hashing.util';
import { 
  getLabMemberIdFromRequest, 
  logItemAdded, 
  logItemRemoved, 
  logStockUpdate, 
  logLocationChange, 
  logMinStockUpdate, 
  logItemUpdate,
  getInventoryLogsForLab,
  getUserAndMemberIdFromRequest,
  checkLabPermission
} from '../../utils/inventoryLogging.util';
import { InventorySource } from '@prisma/client';

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
                                gte: 70,  // Assumption: Manager roles have permission level 70+ AND are active members
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
        // 1. Get current user and their global role
        const currentUser = await prisma.user.findUnique({
            where: { id: sessionUserId },
            include: { role: true },
        });

        if (!currentUser || !currentUser.role) {
            res.status(403).json({ error: 'User role not found or user not found.' });
            return;
        }

        let authorized = false;
        
        if (currentUser.role.permissionLevel >= 100) {
            authorized = true;
        }

        
        if (!authorized) {
            const labManagerRecord = await prisma.labMember.findFirst({
                where: {
                    userId: sessionUserId,
                    labId: labId,
                    labRole: {
                        permissionLevel: { gte: 70 }, // assume: 70 is manager level
                    },
                },
            });
            if (labManagerRecord) {
                authorized = true;
            }
        }

        if (!authorized) {
            res.status(403).json({ error: 'User not authorized to update this lab' });
            return;
        }

        // update if authorized
        const currentLab = await prisma.lab.findUnique({
            where: { id: labId },
        });

        if (!currentLab) {
            res.status(404).json({ error: 'Lab not found' });
            return;
        }

        const updatedLab = await prisma.lab.update({
            where: { id: labId },
            data: {
                name: name !== undefined ? name : currentLab.name,
                location: location !== undefined ? location : currentLab.location,
                status: status !== undefined ? status : currentLab.status,
                updatedAt: new Date(), // Explicitly set updatedAt
            },
        });
        res.status(200).json(updatedLab);
    } catch (error) {
        console.error('Error updating lab:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Handle Prisma errors
            if (error.code === 'P2025') {
                res.status(404).json({ error: 'Lab not found during update' });
                return;
            }
        }
        res.status(500).json({ error: 'Internal server error while updating lab' });
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
        if (currentUser.role.permissionLevel >= 100) {
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
                instruments: true,
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

            // Delete instruments
            await tx.instrument.deleteMany({
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

/**
 * @swagger
 * /admin/lab/{labId}/reset-member-password:
 *   put:
 *     summary: Reset a lab member's password (lab-specific)
 *     description: Allows lab managers or admins to reset a lab member's password with security restrictions
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab
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
 *                 description: ID of the user whose password to reset
 *               newPassword:
 *                 type: string
 *                 description: New password for the user
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       403:
 *         description: Forbidden - cannot reset admin user password as lab manager
 *       404:
 *         description: User not found or not a lab member
 *       500:
 *         description: Internal server error
 */
export const resetLabMemberPassword = async (req: Request, res: Response): Promise<void> => {
    const { labId } = req.params;
    const { userId, newPassword } = req.body;
    const sessionUserId = (req.session as any)?.passport?.user;

    try {
        const labIdInt = parseInt(labId);
        if (isNaN(labIdInt)) {
            res.status(400).json({ error: 'Invalid lab ID' });
            return;
        }

        // Get the user who sent reset request
        const requestor = await prisma.user.findUnique({
            where: { id: sessionUserId },
            include: { role: true }
        });

        if (!requestor || !requestor.role) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        // Get the target user
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { role: true }
        });

        if (!targetUser || !targetUser.role) {
            res.status(404).json({ error: 'Target user not found' });
            return;
        }

        // Verify target user is a member of this lab
        const targetLabMember = await prisma.labMember.findFirst({
            where: {
                userId: userId,
                labId: labIdInt
            },
            include: {
                labRole: true
            }
        });

        if (!targetLabMember) {
            res.status(404).json({ error: 'User is not a member of this lab' });
            return;
        }

        // Security: Prevent lab managers from resetting admin passwords
        const ADMIN_PERMISSION_LEVEL = 100;
        const isRequestorAdmin = requestor.role.permissionLevel >= ADMIN_PERMISSION_LEVEL;
        const isTargetAdmin = targetUser.role.permissionLevel >= ADMIN_PERMISSION_LEVEL;

        if (isTargetAdmin && !isRequestorAdmin) {
            res.status(403).json({ 
                error: 'Lab managers cannot reset passwords of admin users. Please contact a system administrator.' 
            });
            return;
        }

        // Reset the password
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                loginPassword: await hashPassword(newPassword)
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                displayName: true,
            }
        });

        console.log(`Password reset successful: User ${requestor.displayName} (ID: ${sessionUserId}) reset password for user ${targetUser.displayName} (ID: ${userId}) in lab ${labIdInt}`);

        res.status(200).json({ 
            message: 'Password reset successfully',
            user: updatedUser 
        });
    } catch (error) {
        console.error('Error resetting lab member password:', error);
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
            return;
        }
        
        const userInLab = await prisma.labMember.findFirst({
            where: {
                labId: labId,
                userId: userId
            }
        });

        if (!userInLab) {
            res.status(404).json({ error: 'User not in lab' });
            return;
        }

        // Find the "Former Member" role (permission level -1)
        const formerMemberRole = await prisma.labRole.findFirst({
            where: { permissionLevel: -1 }
        });

        if (!formerMemberRole) {
            res.status(500).json({ error: 'Former Member role not found. Please ensure the role exists.' });
            return;
        }

        // Use transaction to update both lab member role and admission status
        await prisma.$transaction(async (tx) => {
            // Soft delete: Update role to "Former Member" instead of deleting
            await tx.labMember.update({
                where: {
                    id: userInLab.id
                },
                data: {
                    labRoleId: formerMemberRole.id
                }
            });

            // Update any APPROVED admission requests to WITHDRAWN so user can reapply
            await tx.labAdmission.updateMany({
                where: {
                    userId: userId,
                    labId: labId,
                    status: 'APPROVED'
                },
                data: {
                    status: 'WITHDRAWN',
                    updatedAt: new Date()
                }
            });
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

/**
 * @swagger
 * /admin/get-lab-roles:
 *   get:
 *     summary: Get all lab roles
 *     description: Retrieves a list of all lab roles available in the system.
 *     tags: [Admin, LabRole]
 *     responses:
 *       200:
 *         description: List of lab roles fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LabRole' 
 *       500:
 *         description: Internal server error
 */
export const getAllLabRoles = async (req: Request, res: Response): Promise<void> => {
    try {
        const labRoles = await prisma.labRole.findMany();
        res.status(200).json(labRoles);
    } catch (error) {
        console.error('Error fetching lab roles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/create-lab-role:
 *   post:
 *     summary: Create a new lab role
 *     description: Creates a new lab role that will be available across all labs
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - permissionLevel
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the lab role
 *                 example: "Senior Technician"
 *               description:
 *                 type: string
 *                 description: Description of the lab role
 *                 example: "Experienced technician with advanced equipment knowledge"
 *               permissionLevel:
 *                 type: integer
 *                 description: Permission level of the role (higher numbers = more permissions)
 *                 example: 45
 *     responses:
 *       201:
 *         description: Lab role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the created lab role
 *                 name:
 *                   type: string
 *                   description: Name of the lab role
 *                 description:
 *                   type: string
 *                   description: Description of the lab role
 *                 permissionLevel:
 *                   type: integer
 *                   description: Permission level of the role
 *       400:
 *         description: Invalid input or role name already exists
 *       500:
 *         description: Internal server error
 */
export const createLabRole = async (req: Request, res: Response): Promise<void> => {
    const { name, description, permissionLevel } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'Role name is required and must be a non-empty string' });
        return;
    }

    if (permissionLevel === undefined || typeof permissionLevel !== 'number') {
        res.status(400).json({ error: 'Permission level is required and must be a number' });
        return;
    }

    // Validate permission level range (assumption: Permissino level must be between 0-100)
    if (permissionLevel < 0 || permissionLevel > 100) {
        res.status(400).json({ error: 'Permission level must be between 0 and 100' });
        return;
    }

    try {
        // Check if a role with the same name already exists
        const existingRole = await prisma.labRole.findFirst({
            where: { name: name.trim() }
        });

        if (existingRole) {
            res.status(400).json({ error: 'A lab role with this name already exists' });
            return;
        }

        // Create the new lab role
        const newLabRole = await prisma.labRole.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                permissionLevel: permissionLevel
            }
        });

        res.status(201).json(newLabRole);
    } catch (error) {
        console.error('Error creating lab role:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                res.status(400).json({ error: 'A lab role with this name already exists' });
                return;
            }
        }
        res.status(500).json({ error: 'Internal server error while creating lab role' });
    }
};

export const activateMemberStatus = async (req: Request, res: Response): Promise<void> => {
    const memberStatusId = parseInt(req.params.memberStatusId);
    // TODO: Add robust authorization checks (e.g. is the requester an admin of the lab this member belongs to?)

    if (isNaN(memberStatusId)) {
        res.status(400).json({ error: 'Invalid MemberStatus ID' });
        return;
    }

    try {
        const targetMemberStatus = await prisma.memberStatus.findUnique({
            where: { id: memberStatusId },
            select: { memberId: true } // We need the labMemberId to deactivate others
        });

        if (!targetMemberStatus) {
            res.status(404).json({ error: 'MemberStatus entry not found' });
            return;
        }

        const labMemberId = targetMemberStatus.memberId;

        
        await prisma.$transaction(async (tx) => {
            // Deactivate all current statuses for this lab member
            await tx.memberStatus.updateMany({
                where: { memberId: labMemberId },
                data: { isActive: false },
            });

            // Activate the target status
            await tx.memberStatus.update({
                where: { id: memberStatusId },
                data: { isActive: true },
            });
        });

        
        res.status(200).json({ message: 'Member status activated successfully', activatedMemberStatusId: memberStatusId });

    } catch (error) {
        console.error('Error activating member status:', error);
        // Check for Prisma errors
        res.status(500).json({ error: 'Internal server error while activating member status' });
    }
};

export const updateMemberStatus = async (req: Request, res: Response): Promise<void> => {
    const memberStatusId = parseInt(req.params.memberStatusId);
    const { description } = req.body;
    // TODO: Add robust authorization checks

    if (isNaN(memberStatusId)) {
        res.status(400).json({ error: 'Invalid MemberStatus ID' });
        return;
    }

    if (typeof description !== 'string') { // Base validation for description
        res.status(400).json({ error: 'Invalid description provided' });
        return;
    }

    try {
        const updatedMemberStatus = await prisma.memberStatus.update({
            where: { id: memberStatusId },
            data: { description: description },
        });

        res.status(200).json(updatedMemberStatus);

    } catch (error: any) {
        console.error('Error updating member status:', error);
        if (error.code === 'P2025') { // Prisma error code for record not found
            res.status(404).json({ error: 'MemberStatus entry not found' });
        } else {
            res.status(500).json({ error: 'Internal server error while updating member status' });
        }
    }
};

export const deleteMemberStatus = async (req: Request, res: Response): Promise<void> => {
    const memberStatusId = parseInt(req.params.memberStatusId);
    // TODO: Add robust authorization checks

    if (isNaN(memberStatusId)) {
        res.status(400).json({ error: 'Invalid MemberStatus ID' });
        return;
    }

    try {
        // First, check if the MemberStatus is currently active
        
        // For now allow deletion regardless of active state
        const memberStatusToDelete = await prisma.memberStatus.findUnique({
            where: { id: memberStatusId },
        });

        if (!memberStatusToDelete) {
            res.status(404).json({ error: 'MemberStatus entry not found' });
            return;
        }

        

        await prisma.memberStatus.delete({
            where: { id: memberStatusId },
        });

        res.status(200).json({ message: 'MemberStatus entry deleted successfully' });

    } catch (error: any) {
        console.error('Error deleting member status:', error);
        if (error.code === 'P2025') { 
            res.status(404).json({ error: 'MemberStatus entry not found' });
        } else {
            res.status(500).json({ error: 'Internal server error while deleting member status' });
        }
    }
};

export const createMemberStatusForLabMember = async (req: Request, res: Response): Promise<void> => {
    const labMemberId = parseInt(req.params.labMemberId);
    const { statusId, contactId, description } = req.body;
    // TODO: Add robust authorization checks (is admin of the lab this member belongs to?)

    if (isNaN(labMemberId)) {
        res.status(400).json({ error: 'Invalid LabMember ID' });
        return;
    }
    if (statusId === undefined || contactId === undefined) {
        res.status(400).json({ error: 'statusId and contactId are required' });
        return;
    }
    if (description === undefined || typeof description !== 'string') {
        // Allowing empty string for description, but it must be provided
        res.status(400).json({ error: 'Description must be a string' });
        return;
    }

    try {
        // Verify labMember, status, and contact exist before creating
        const labMember = await prisma.labMember.findUnique({ where: { id: labMemberId } });
        if (!labMember) {
            res.status(404).json({ error: 'LabMember not found' });
            return;
        }
        const globalStatus = await prisma.status.findUnique({ where: { id: parseInt(statusId) } });
        if (!globalStatus) {
            res.status(404).json({ error: 'Global Status type not found' });
            return;
        }
        const contact = await prisma.contact.findUnique({ where: { id: parseInt(contactId) } });
        if (!contact) {
            res.status(404).json({ error: 'Contact not found' });
            return;
        }
        // Ensure the contact belongs to the user associated with the labMember
        if (contact.userId !== labMember.userId) {
            res.status(403).json({ error: 'Contact does not belong to the specified lab member\'s user account.' });
            return;
        }

        const newMemberStatus = await prisma.memberStatus.create({
            data: {
                memberId: labMemberId,
                statusId: parseInt(statusId),
                contactId: parseInt(contactId),
                description: description,
                isActive: false, // New statuses are created as inactive by default. Admin can activate separately
            },
            include: { 
                status: true,
                contact: true,
            }
        });

        res.status(201).json(newMemberStatus);

    } catch (error: any) {
        console.error('Error creating new member status:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            // Unique constraint failed 
             res.status(409).json({ error: 'This status configuration might already exist for the member.' });
        } else {
            res.status(500).json({ error: 'Internal server error while creating member status' });
        }
    }
};

export const updateLabMemberRole = async (req: Request, res: Response): Promise<void> => {
    const labMemberId = parseInt(req.params.labMemberId);
    const { newLabRoleId } = req.body;
    // TODO: Add robust authorization checks

    if (isNaN(labMemberId)) {
        res.status(400).json({ error: 'Invalid LabMember ID' });
        return;
    }
    if (newLabRoleId === undefined || isNaN(parseInt(newLabRoleId))) {
        res.status(400).json({ error: 'newLabRoleId is required and must be a number' });
        return;
    }

    try {
        const labRoleExists = await prisma.labRole.findUnique({ where: { id: parseInt(newLabRoleId) } });
        if (!labRoleExists) {
            res.status(404).json({ error: 'Specified LabRole ID not found' });
            return;
        }

        // Prevent manual assignment of "Former Member" role
        if (labRoleExists.name.toLowerCase() === 'former member') {
            res.status(400).json({ 
                error: 'Cannot manually assign "Former Member" role. This role is system-managed and only assigned during member removal.' 
            });
            return;
        }

        const updatedLabMember = await prisma.labMember.update({
            where: { id: labMemberId },
            data: { labRoleId: parseInt(newLabRoleId) },
            include: { user: true, labRole: true } // Return updated member with role details
        });

        res.status(200).json(updatedLabMember);

    } catch (error: any) {
        console.error('Error updating lab member role:', error);
        if (error.code === 'P2025') { // Prisma record not found
            res.status(404).json({ error: 'LabMember not found' });
        } else {
            res.status(500).json({ error: 'Internal server error while updating role' });
        }
    }
};

export const toggleLabMemberInduction = async (req: Request, res: Response): Promise<void> => {
    const labMemberId = parseInt(req.params.labMemberId);
    // TODO: Add robust authorization checks

    if (isNaN(labMemberId)) {
        res.status(400).json({ error: 'Invalid LabMember ID' });
        return;
    }

    try {
        const labMember = await prisma.labMember.findUnique({ where: { id: labMemberId } });
        if (!labMember) {
            res.status(404).json({ error: 'LabMember not found' });
            return;
        }

        const updatedLabMember = await prisma.labMember.update({
            where: { id: labMemberId },
            data: { inductionDone: !labMember.inductionDone }, // Toggle the current value
            include: { user: true, labRole: true } 
        });

        res.status(200).json(updatedLabMember);

    } catch (error: any) {
        console.error('Error toggling lab member induction status:', error);
        if (error.code === 'P2025') { 
            res.status(404).json({ error: 'LabMember not found during update' });
        } else {
            res.status(500).json({ error: 'Internal server error while toggling induction status' });
        }
    }
};

/**
 * @desc Toggle a lab member's PCI status
 * @route PUT /api/admin/lab-member/:labMemberId/pci
 * @access Private (Requires permission level 60)
 */
export const toggleLabMemberPCI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { labMemberId } = req.params;
    const { isPCI } = req.body;

    if (typeof isPCI !== 'boolean') {
      res.status(400).json({ message: 'Invalid input: isPCI must be a boolean.' });
      return;
    }

    const memberIdInt = parseInt(labMemberId, 10);
    if (isNaN(memberIdInt)) {
      res.status(400).json({ message: 'Invalid labMemberId.' });
      return;
    }

    const existingMember = await prisma.labMember.findUnique({
      where: { id: memberIdInt },
    });

    if (!existingMember) {
      res.status(404).json({ message: 'Lab member not found.' });
      return;
    }

    const updatedLabMember = await prisma.labMember.update({
      where: { id: memberIdInt },
      data: { isPCI },
    });

    res.status(200).json(updatedLabMember);
  } catch (error) {
    console.error('Error toggling lab member PCI status:', error);
    if (error instanceof Error) {
        res.status(500).json({ message: 'Server error toggling PCI status.', error: error.message });
        return;
    }
    res.status(500).json({ message: 'Server error toggling PCI status.' });
  }
};

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

    // Check lab-based permissions (lab managers 60+ can manage, admins 60+ can access)
    const permissionCheck = await checkLabPermission(req, labId, 60, 60);
    
    if (!permissionCheck.hasPermission) {
        res.status(403).json({ error: permissionCheck.error || 'Access denied' });
        return;
    }

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

        // Log the item addition using permission check results
        if (permissionCheck.userId) {
            await logItemAdded(
                newLabItem.id,
                permissionCheck.userId,
                {
                    itemId: newLabItem.itemId,
                    itemName: item.name,
                    location: newLabItem.location,
                    itemUnit: newLabItem.itemUnit,
                    currentStock: newLabItem.currentStock,
                    minStock: newLabItem.minStock,
                    labId: labId 
                },
                permissionCheck.source,
                `Item added to lab via admin panel${permissionCheck.isAdmin ? ' (admin user)' : ''}`,
                permissionCheck.memberId
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

    // Check lab-based permissions (lab managers 60+ can manage, admins 60+ can access)
    const permissionCheck = await checkLabPermission(req, labId, 60, 60);
    
    if (!permissionCheck.hasPermission) {
        res.status(403).json({ error: permissionCheck.error || 'Access denied' });
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

        // Log the item removal before deletion using permission check results
        if (permissionCheck.userId) {
            await logItemRemoved(
                itemId,
                permissionCheck.userId,
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
                permissionCheck.source,
                `Item removed from lab via admin panel${permissionCheck.isAdmin ? ' (admin user)' : ''}`,
                permissionCheck.memberId
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

    if (!name || typeof name !== 'string') {
        res.status(400).json({ error: 'Tag name is required and must be a string' });
        return;
    }

    try {
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

/**
 * @swagger
 * /admin/lab/{labId}/available-users:
 *   get:
 *     summary: Get users available to be added to a lab
 *     description: Retrieves users who are not currently active members of the specified lab, including former members and users who were never in the lab. Supports search and pagination.
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter users by name, email, or username
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: List of available users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       displayName:
 *                         type: string
 *                       loginEmail:
 *                         type: string
 *                       jobTitle:
 *                         type: string
 *                       office:
 *                         type: string
 *                       isFormerMember:
 *                         type: boolean
 *                         description: Whether this user was previously a member of the lab
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalCount:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       400:
 *         description: Invalid lab ID or query parameters
 *       404:
 *         description: Lab not found
 *       500:
 *         description: Internal server error
 */
export const getAvailableUsersForLab = async (req: Request, res: Response): Promise<void> => {
    const labId = parseInt(req.params.labId);
    const search = req.query.search as string || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100); // Cap at 100 users per page

    if (isNaN(labId)) {
        res.status(400).json({ error: 'Invalid lab ID' });
        return;
    }

    if (page < 1 || limit < 1) {
        res.status(400).json({ error: 'Invalid pagination parameters' });
        return;
    }

    try {
        // Verify lab exists
        const lab = await prisma.lab.findUnique({
            where: { id: labId }
        });

        if (!lab) {
            res.status(404).json({ error: 'Lab not found' });
            return;
        }

        // Get all current active lab members (not former members)
        const activeLabMembers = await prisma.labMember.findMany({
            where: {
                labId: labId,
                labRole: {
                    permissionLevel: {
                        gte: 0 
                    }
                }
            },
            select: {
                userId: true
            }
        });

        const activeUserIds = activeLabMembers.map(member => member.userId);

        // Build search conditions
        const searchConditions = search ? {
            OR: [
                { displayName: { contains: search, mode: 'insensitive' as const } },
                { firstName: { contains: search, mode: 'insensitive' as const } },
                { lastName: { contains: search, mode: 'insensitive' as const } },
                { loginEmail: { contains: search, mode: 'insensitive' as const } },
                { username: { contains: search, mode: 'insensitive' as const } }
            ]
        } : {};

        // Get users who are not active members
        const whereCondition = {
            ...searchConditions,
            id: {
                notIn: activeUserIds
            }
        };

        // Get total count for pagination support
        const totalCount = await prisma.user.count({
            where: whereCondition
        });

        // Get paginated users
        const users = await prisma.user.findMany({
            where: whereCondition,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                displayName: true,
                loginEmail: true,
                jobTitle: true,
                office: true,
                labMembers: {
                    where: {
                        labId: labId,
                        labRole: {
                            permissionLevel: -1 // Former member
                        }
                    },
                    select: {
                        id: true
                    }
                }
            },
            orderBy: [
                { displayName: 'asc' },
                { lastName: 'asc' },
                { firstName: 'asc' }
            ],
            skip: (page - 1) * limit,
            take: limit
        });

        // Format response with isFormerMember flag
        const formattedUsers = users.map(user => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            displayName: user.displayName,
            loginEmail: user.loginEmail,
            jobTitle: user.jobTitle,
            office: user.office,
            isFormerMember: user.labMembers.length > 0
        }));

        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            users: formattedUsers,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages
            }
        });

    } catch (error) {
        console.error('Error fetching available users for lab:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/lab/{labId}/add-user:
 *   post:
 *     summary: Add a user to a lab or reactivate a former member
 *     description: Adds a new user to a lab with a specified role, or reactivates a former member with a new role.
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - labRoleId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user to add to the lab
 *               labRoleId:
 *                 type: integer
 *                 description: ID of the lab role to assign to the user
 *     responses:
 *       201:
 *         description: User added to lab successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 labMember:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     userId:
 *                       type: integer
 *                     labId:
 *                       type: integer
 *                     labRoleId:
 *                       type: integer
 *                     isReactivated:
 *                       type: boolean
 *                       description: Whether this was a reactivation of a former member
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Lab not found, user not found, or lab role not found
 *       409:
 *         description: User is already an active member of the lab
 *       500:
 *         description: Internal server error
 */
export const addUserToLabEndpoint = async (req: Request, res: Response): Promise<void> => {
    const labId = parseInt(req.params.labId);
    const { userId, labRoleId } = req.body;

    if (isNaN(labId) || !userId || !labRoleId) {
        res.status(400).json({ error: 'Lab ID, user ID, and lab role ID are required' });
        return;
    }

    try {
        // Verify lab exists
        const lab = await prisma.lab.findUnique({
            where: { id: labId }
        });

        if (!lab) {
            res.status(404).json({ error: 'Lab not found' });
            return;
        }

        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Verify lab role exists and is not the "Former Member" role
        const labRole = await prisma.labRole.findUnique({
            where: { id: labRoleId }
        });

        if (!labRole) {
            res.status(404).json({ error: 'Lab role not found' });
            return;
        }

        if (labRole.permissionLevel === -1) {
            res.status(400).json({ error: 'Cannot assign Former Member role directly' });
            return;
        }

        // Check if user is already an active member
        const existingActiveMember = await prisma.labMember.findFirst({
            where: {
                userId: userId,
                labId: labId,
                labRole: {
                    permissionLevel: {
                        gte: 0 
                    }
                }
            }
        });

        if (existingActiveMember) {
            res.status(409).json({ error: 'User is already an active member of this lab' });
            return;
        }

        // Check if user is a former member that can be reactivated
        const formerMember = await prisma.labMember.findFirst({
            where: {
                userId: userId,
                labId: labId,
                labRole: {
                    permissionLevel: -1 
                }
            }
        });

        // Get user's first contact for member status creation
        const userFirstContact = await prisma.contact.findFirst({
            where: { 
                userId: userId,
            },
            orderBy: { id: 'asc' } 
        });

        if (!userFirstContact) {
            res.status(400).json({ error: 'User has no contact information' });
            return;
        }

        let labMember;
        let isReactivated = false;

        // Use transaction to ensure consistency across admission and member records
        const result = await prisma.$transaction(async (tx) => {
            let updatedLabMember;

            if (formerMember) {
                // Reactivate former member by updating their role
                updatedLabMember = await tx.labMember.update({
                    where: { id: formerMember.id },
                    data: {
                        labRoleId: labRoleId,
                        updatedAt: new Date()
                    }
                });
                isReactivated = true;
            } else {
                // Create new lab member
                updatedLabMember = await tx.labMember.create({
                    data: {
                        userId: userId,
                        labId: labId,
                        labRoleId: labRoleId,
                        inductionDone: false,
                        isPCI: false
                    }
                });
            }

            // Create member statuses only for new members (not reactivated ones)
            if (!isReactivated) {
                await tx.memberStatus.create({
                    data: {
                        description: 'Default online status',
                        contactId: userFirstContact.id,
                        memberId: updatedLabMember.id,
                        isActive: false,
                        statusId: 1, 
                    }
                });
                
                await tx.memberStatus.create({
                    data: {
                        description: 'Default offline status',
                        contactId: userFirstContact.id,
                        memberId: updatedLabMember.id,
                        isActive: true,
                        statusId: 3, 
                    }
                });
            }

            // Create 'approved' admission record to maintain consistency with admission process
            const admissionRecord = await tx.labAdmission.create({
                data: {
                    labId: labId,
                    userId: userId,
                    roleId: labRoleId,
                    status: 'APPROVED' as any, 
                    isPCI: false, // Default to false, can make this configurable later if needed (otherwise, manager/admin can change via 'Manage Members' tab)
                }
            });

            // Update user's last viewed lab if not set
            if (!user.lastViewedLabId) {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        lastViewedLabId: labId,
                        lastViewed: `/lab/${labId}`
                    }
                });
            }

            return { updatedLabMember, admissionRecord };
        });

        res.status(201).json({
            message: isReactivated ? 'User reactivated in lab successfully' : 'User added to lab successfully',
            labMember: {
                id: result.updatedLabMember.id,
                userId: result.updatedLabMember.userId,
                labId: result.updatedLabMember.labId,
                labRoleId: result.updatedLabMember.labRoleId,
                isReactivated
            },
            admissionRecord: {
                id: result.admissionRecord.id,
                status: result.admissionRecord.status
            }
        });

    } catch (error) {
        console.error('Error adding user to lab:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};