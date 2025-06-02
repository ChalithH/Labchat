import { Request, Response } from 'express';
import { prisma } from '../..';

/**
 * Get lab member by ID
 * 
 * @param {Request} req - Express request object with ID parameter
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with lab member data or error
 * 
 * @swagger
 * /member/get/{id}:
 *   get:
 *     summary: Get lab member by ID
 *     description: Retrieve a specific lab member using their unique ID
 *     tags: [Lab members]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the lab member to retrieve
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Lab member found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabMember'
 *       404:
 *         description: Lab member not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: "Lab member not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: "Failed to retrieve lab member"
 */
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

/**
 * Get lab member by user ID
 * 
 * @param {Request} req - Express request object with user ID parameter
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with lab member data or error
 * 
 * @swagger
 * /member/get/user/{id}:
 *   get:
 *     summary: Get lab member by user ID
 *     description: Retrieve a lab member using their associated user ID
 *     tags: [Lab members]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric user ID to find the associated lab member
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Lab member found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabMember'
 *       404:
 *         description: Lab member not found for the given user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: "Lab member not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: "Failed to retrieve lab member"
 */
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
 * Get all member statuses
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with status list or error
 * 
 * @swagger
 * /member/statuses:
 *   get:
 *     summary: Get all member statuses
 *     description: Retrieve a list of all available member status names
 *     tags: [Lab members]
 *     responses:
 *       200:
 *         description: List of member statuses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   statusName:
 *                     type: string
 *                     description: Name of the status
 *             example:
 *               - statusName: "Active"
 *               - statusName: "Inactive"
 *               - statusName: "On Leave"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: "Failed to retrieve member statuses"
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

