import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../utils/hashing.util';
import { PERMISSIONS } from '../../config/permissions';

const prisma = new PrismaClient();

/**
 * @swagger
 * /admin/remove-user:
 *   delete:
 *     summary: Remove a user from a lab (soft delete)
 *     description: Removes a user from a lab by changing their role to "Former Member"
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
    
    if (!labId || !userId) {
        res.status(400).json({ error: 'labId and userId are required' });
        return;
    }
    
    // Add labId to params for permission middleware
    req.params.labId = labId.toString();
    
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
            where: { permissionLevel: PERMISSIONS.FORMER_MEMBER }
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
        const isRequestorAdmin = requestor.role.permissionLevel >= PERMISSIONS.GLOBAL_ADMIN;
        const isTargetAdmin = targetUser.role.permissionLevel >= PERMISSIONS.GLOBAL_ADMIN;

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

/**
 * @swagger
 * /admin/lab-member/{labMemberId}/role:
 *   put:
 *     summary: Update a lab member's role
 *     description: Changes the role of a lab member within a specific lab
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: labMemberId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab member
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - labRoleId
 *             properties:
 *               labRoleId:
 *                 type: integer
 *                 description: ID of the new lab role to assign
 *     responses:
 *       200:
 *         description: Lab member role updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Lab member or role not found
 *       500:
 *         description: Internal server error
 */
export const updateLabMemberRole = async (req: Request, res: Response): Promise<void> => {
    const labMemberId = parseInt(req.params.labMemberId);
    const { newLabRoleId } = req.body;

    if (isNaN(labMemberId)) {
        res.status(400).json({ error: 'Invalid LabMember ID' });
        return;
    }
    if (newLabRoleId === undefined || isNaN(parseInt(newLabRoleId))) {
        res.status(400).json({ error: 'newLabRoleId is required and must be a number' });
        return;
    }

    try {
        // Get lab member
        const labMember = await prisma.labMember.findUnique({
            where: { id: labMemberId }
        });

        if (!labMember) {
            res.status(404).json({ error: 'LabMember not found' });
            return;
        }


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

/**
 * @swagger
 * /admin/lab-member/{labMemberId}/induction:
 *   put:
 *     summary: Toggle lab member induction status
 *     description: Toggles the induction completion status for a lab member
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: labMemberId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab member
 *     responses:
 *       200:
 *         description: Induction status toggled successfully
 *       400:
 *         description: Invalid lab member ID
 *       404:
 *         description: Lab member not found
 *       500:
 *         description: Internal server error
 */
export const toggleLabMemberInduction = async (req: Request, res: Response): Promise<void> => {
    const labMemberId = parseInt(req.params.labMemberId);

    if (isNaN(labMemberId)) {
        res.status(400).json({ error: 'Invalid LabMember ID' });
        return;
    }

    try {
        const labMember = await prisma.labMember.findUnique({ 
            where: { id: labMemberId },
            select: { id: true, inductionDone: true }
        });
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
 * @swagger
 * /admin/lab-member/{labMemberId}/pci:
 *   put:
 *     summary: Set lab member PCI status
 *     description: Sets the PCI (Physical Containment) status for a lab member based on request body
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: labMemberId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab member
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isPCI
 *             properties:
 *               isPCI:
 *                 type: boolean
 *                 description: PCI status to set
 *     responses:
 *       200:
 *         description: PCI status updated successfully
 *       400:
 *         description: Invalid lab member ID or input
 *       404:
 *         description: Lab member not found
 *       500:
 *         description: Internal server error
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
      where: { id: memberIdInt }
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
                        gte: PERMISSIONS.LAB_MEMBER 
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
                            permissionLevel: PERMISSIONS.FORMER_MEMBER // Former member
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

        if (labRole.permissionLevel === PERMISSIONS.FORMER_MEMBER) {
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
                        gte: PERMISSIONS.LAB_MEMBER 
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
                    permissionLevel: PERMISSIONS.FORMER_MEMBER 
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
                        lastViewed: `/home`
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