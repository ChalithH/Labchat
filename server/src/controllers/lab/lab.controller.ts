import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { status } from '../auth/auth.controller';

const prisma = new PrismaClient();


 /**
 * @swagger
 * /lab/{labId}:
 *   get:
 *     summary: Get a lab by ID
 *     description: Retrieve details of a specific lab using its unique ID.
 *     tags: [Lab]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab to retrieve
 *     responses:
 *       200:
 *         description: Lab details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lab'
 *       404:
 *         description: Lab not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Lab not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to retrieve info
 */

export const getLab = async (req: Request, res: Response): Promise<void> => {
    const labId = req.params.labId; // Assuming labId is passed as a URL parameter
    try {
        const lab = await prisma.lab.findUnique({
            where: { id: Number(labId) },
        });
        
        res.json(lab);
    } catch (error) {
        console.error("Error retrieving lab info:", error);
        res.status(500).json({ error: 'Failed to retrieve info' });
    }
};

/**
 * @swagger
 * /lab/getMembers/{labId}:
 *   get:
 *     summary: Get all members of a specific lab
 *     tags: [Lab]
 *     parameters:
 *       - in: path
 *         name: labId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the lab
 *     responses:
 *       200:
 *         description: List of lab members with user details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LabMember'
 *       500:
 *         description: Failed to retrieve lab member info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export const getLabMembers = async (req: Request, res: Response): Promise<void> => {
    const labId = req.params.labId; // Assuming labId is passed as a URL parameter
    try {
        const labMembers = await prisma.labMember.findMany({
            where: { labId: Number(labId) },
            select: {
                id: true,
                userId: true,
                labId: true,
                inductionDone: true,
                createdAt: true,
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
                    select: {
                        status: true,
                        isActive: true,
                        contact: { 
                            select: {
                                type: true,
                                info: true,
                                name: true,
                            },
                        }
                    },
                }, 
            },
        });

        const flattenedMembers = labMembers.map((member) => ({
            ...member.user,
            memberID: member.id,
            labID: member.labId,
            createdAt: member.createdAt,
            inductionDone: member.inductionDone,
            status: member.memberStatus.map((status) => ({
                status: status.status,
                isActive: status.isActive,
                contactType: status.contact.type,
                contactInfo: status.contact.info,
                contactName: status.contact.name,
            })),
          }));
      
        res.json(flattenedMembers);
        
    } catch (error) {
        console.error("Error retrieving lab info:", error);
        res.status(500).json({ error: 'Failed to retrieve info' });
    }
};

