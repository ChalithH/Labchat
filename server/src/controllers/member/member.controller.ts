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
 *       500:
 *         description: Failed to retrieve member statuses
 */
export const getStatuses = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Fetching member statuses...");

    const statuses = await prisma.status.findMany({
      select: {
        id: false,
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

