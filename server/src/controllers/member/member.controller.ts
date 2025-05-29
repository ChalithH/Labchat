import { Request, Response } from 'express';
import { prisma } from '../..';


export const getMemberById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.labMember.findUnique({
      where: { id },
    });
    
    if (!user) {
      res.status(404).json({ error: 'Lab member not found' });
      return;
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve lab member' });
  }
};

export const getMemberByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.labMember.findFirst({
      where: { userId: id },
    });
    
    if (!user) {
      res.status(404).json({ error: 'Lab member not found' });
      return;
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve lab member' });
  }
};

/**
 * @swagger
 * /member/statuses:
 *   get:
 *     summary: Get all member statuses
 *     tags: [Members]
 *     responses:
 *       200:
 *         description: A list of member statuses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   statusName:
 *                     type: string
 *                   id: 
 *                     type: integer
 *       500:
 *         description: Failed to retrieve member statuses
 */
export const getStatuses = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Fetching member statuses...");

    const statuses = await prisma.status.findMany({
      select: {
        id: true,
        statusName: true,
        statusWeight: false
      }
    });

    res.status(200).json(statuses);
  } catch (error) {
    console.error("Error retrieving statuses:", error);
    res.status(500).json({ error: 'Failed to retrieve member statuses' });
  }
};

/**
 * @swagger
 * /member/set-status:
 *   post:
 *     summary: Set a member's status as active and all others as inactive
 *     tags: [Members]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *               - statusId
 *             properties:
 *               memberId:
 *                 type: integer
 *                 description: The member's ID
 *               statusId:
 *                 type: integer
 *                 description: The status ID to set as active
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Status updated successfully
 *       400:
 *         description: memberId and statusId are required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: memberId and statusId are required
 *       404:
 *         description: Status not found for this member
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Status not found for this member
 *       500:
 *         description: Failed to update status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to update status
 */
export const setStatus = async (req: Request, res: Response): Promise<void> => {
  const { memberId, statusId } = req.body;
  if (!memberId || !statusId) {
    res.status(400).json({ error: 'memberId and statusId are required' });
    return;
  }
  try {
    // Check if the member has the selected status
    const statusRecord = await prisma.memberStatus.findFirst({
      where: { memberId, statusId },
    });
    if (!statusRecord) {
      res.status(404).json({ error: 'Status not found for this member' });
      return;
    }
    // Set all statuses for this member to inactive
    await prisma.memberStatus.updateMany({
      where: { memberId },
      data: { isActive: false },
    });
    // Set the selected status to active
    await prisma.memberStatus.updateMany({
      where: { memberId, statusId },
      data: { isActive: true },
    });
    res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

/**
 * Get a member by ID with full status array (flattened)
 * GET /member/get-with-status/:id
 */
export const getMemberWithStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.labMember.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            jobTitle: true,
            office: true,
            bio: true,
          },
        },
        memberStatus: {
          include: {
            status: true,
            contact: true,
          },
        },
      },
    });
    if (!user) {
      res.status(404).json({ error: 'Lab member not found' });
      return;
    }
    const flattened = {
      ...user.user,
      memberID: user.id,
      labID: user.labId,
      createdAt: user.createdAt,
      inductionDone: user.inductionDone,
      status: user.memberStatus.map((status) => ({
        status: status.status,
        isActive: status.isActive,
        contactType: status.contact?.type,
        contactInfo: status.contact?.info,
        contactName: status.contact?.name,
      })),
    };
    res.json(flattened);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve lab member with status' });
  }
};

export const getMembershipsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const memberships = await prisma.labMember.findMany({
      where: { userId: userId },
    });
    
    if (!memberships || memberships.length === 0) {
      res.status(404).json({ error: 'No lab memberships found for this user' });
      return;
    }
    
    res.json(memberships);
  } catch (error) {
    console.error('Error retrieving memberships by user ID:', error);
    res.status(500).json({ error: 'Failed to retrieve lab memberships' });
  }
};

