import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /admin/member-status/{memberStatusId}/activate:
 *   put:
 *     summary: Activate a member status
 *     description: Activates a specific member status and deactivates all other statuses for the same contact
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: memberStatusId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the member status to activate
 *     responses:
 *       200:
 *         description: Member status activated successfully
 *       400:
 *         description: Invalid member status ID
 *       404:
 *         description: Member status not found
 *       500:
 *         description: Internal server error
 */
export const activateMemberStatus = async (req: Request, res: Response): Promise<void> => {
    const memberStatusId = parseInt(req.params.memberStatusId);

    if (isNaN(memberStatusId)) {
        res.status(400).json({ error: 'Invalid MemberStatus ID' });
        return;
    }

    try {
        const targetMemberStatus = await prisma.memberStatus.findUnique({
            where: { id: memberStatusId },
            select: { 
                memberId: true,
                labMember: {
                    select: { labId: true }
                }
            }
        });

        if (!targetMemberStatus) {
            res.status(404).json({ error: 'MemberStatus entry not found' });
            return;
        }

        // Lab ID extraction done in middleware

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

/**
 * @swagger
 * /admin/member-status/{memberStatusId}:
 *   put:
 *     summary: Update a member status description
 *     description: Updates the description of a specific member status
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: memberStatusId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the member status to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 type: string
 *                 description: New description for the member status
 *     responses:
 *       200:
 *         description: Member status updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Member status not found
 *       500:
 *         description: Internal server error
 */
export const updateMemberStatus = async (req: Request, res: Response): Promise<void> => {
    const memberStatusId = parseInt(req.params.memberStatusId);
    const { description } = req.body;

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

/**
 * @swagger
 * /admin/member-status/{memberStatusId}:
 *   delete:
 *     summary: Delete a member status
 *     description: Deletes a specific member status
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: memberStatusId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the member status to delete
 *     responses:
 *       200:
 *         description: Member status deleted successfully
 *       400:
 *         description: Invalid member status ID
 *       404:
 *         description: Member status not found
 *       500:
 *         description: Internal server error
 */
export const deleteMemberStatus = async (req: Request, res: Response): Promise<void> => {
    const memberStatusId = parseInt(req.params.memberStatusId);

    if (isNaN(memberStatusId)) {
        res.status(400).json({ error: 'Invalid MemberStatus ID' });
        return;
    }

    try {
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

/**
 * @swagger
 * /admin/lab-member/{labMemberId}/status:
 *   post:
 *     summary: Create a member status for a lab member
 *     description: Creates a new member status for a specific lab member
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
 *               - statusId
 *               - description
 *             properties:
 *               statusId:
 *                 type: integer
 *                 description: ID of the status type
 *               description:
 *                 type: string
 *                 description: Description for the member status
 *               isActive:
 *                 type: boolean
 *                 description: Whether the status should be active (default false)
 *     responses:
 *       201:
 *         description: Member status created successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Lab member or status type not found
 *       500:
 *         description: Internal server error
 */
export const createMemberStatusForLabMember = async (req: Request, res: Response): Promise<void> => {
    const labMemberId = parseInt(req.params.labMemberId);
    const { statusId, contactId, description } = req.body;

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
        const labMember = await prisma.labMember.findUnique({ 
            where: { id: labMemberId },
            select: { id: true, userId: true, labId: true }
        });
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