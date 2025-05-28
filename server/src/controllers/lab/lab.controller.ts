import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

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
 *         description: The ID of the lab to retrieve.
 *     responses:
 *       200:
 *         description: Lab details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lab'
 *       404:
 *         description: Lab not found.
 *       500:
 *         description: Internal server error.
 */
export const getLab = async (req: Request, res: Response): Promise<void> => {
    const labId = req.params.labId; 
    try {
        const lab = await prisma.lab.findUnique({
            where: { id: Number(labId) },
        });
        
        if (!lab) {
            res.status(404).json({ error: 'Lab not found' });
            return;
        }
        res.json(lab);
    } catch (error) {
        console.error(`Error retrieving lab with ID ${labId}:`, error);
        res.status(500).json({ error: 'Failed to retrieve lab information' });
    }
};

/**
 * @swagger
 * /lab/getMembers/{labId}:
 *   get:
 *     summary: Get all members of a specific lab.
 *     description: >
 *       Retrieves a list of all members associated with the given labId.
 *       The response includes flattened user details, lab membership specifics (like labRoleId),
 *       and a structured list of their statuses (MemberStatus entries with nested Contact and global Status info).
 *     tags: [Lab]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the lab whose members are to be fetched.
 *     responses:
 *       200:
 *         description: A list of lab members with their details.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LabMember' # Ensure this schema matches the transformed output
 *       500:
 *         description: Internal server error.
 */
export const getLabMembers = async (req: Request, res: Response): Promise<void> => {
    const labId = req.params.labId; 
    try {
        const labMembersFromDb = await prisma.labMember.findMany({
            where: { labId: Number(labId) },
            select: {
                id: true,          
                userId: true,
                labId: true,
                labRoleId: true,
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
                        id: true,          
                        contactId: true,
                        statusId: true,
                        isActive: true,
                        description: true,
                        contact: {     // Nested contact details for this status entry
                            select: {
                                id: true,      
                                type: true,
                                info: true,
                                useCase: true,
                                name: true,
                            },
                        },
                        status: {      
                            select: {
                                id: true,     
                                statusName: true,
                                statusWeight: true,
                            }
                        }
                    },
                }, 
            },
        });

        
        const formattedMembers = labMembersFromDb.map((member) => ({
            
            id: member.user.id,             
            firstName: member.user.firstName,
            lastName: member.user.lastName,
            displayName: member.user.displayName,
            jobTitle: member.user.jobTitle,
            office: member.user.office,
            bio: member.user.bio,

            // LabMember specific details
            memberID: member.id,            
            labID: member.labId,           
            labRoleId: member.labRoleId,      
            createdAt: member.createdAt,
            inductionDone: member.inductionDone,

            
            status: member.memberStatus, 
          }));
      
        res.json(formattedMembers);
        
    } catch (error) {
        console.error(`Error retrieving members for lab ID ${labId}:`, error);
        res.status(500).json({ error: 'Failed to retrieve lab members' });
    }
};


/**
 * @swagger
 * /lab/getMembersList/{labId}:
 *   get:
 *     summary: Get a simplified list of members for a lab.
 *     description: Retrieves a list of lab members, primarily for display name and ID purposes (e.g., in dropdowns).
 *     tags: [Lab]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the lab.
 *     responses:
 *       200:
 *         description: A simplified list of lab members.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: 
 *                     type: integer
 *                     description: User ID.
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   displayName:
 *                     type: string
 *                   memberID: 
 *                     type: integer
 *                     description: LabMember ID.
 *                   labID:
 *                     type: string # Should be integer based on schema, but example shows string
 *                     description: Lab ID.
 *       500:
 *         description: Internal server error.
 */
export const getLabMembersList = async (req: Request, res: Response): Promise<void> => {
    const labIdParam = req.params.labId;
    try {
        const labMembers = await prisma.labMember.findMany({
            where: { labId: Number(labIdParam) },
            select: {
                id: true,      
                user: { 
                    select: {
                        id: true,  
                        firstName: true,
                        lastName: true,
                        displayName: true,
                    },
                }, 
            },
        });

        // Flatten user details and include LabMember ID and Lab ID.
        const flattenedMembers = labMembers.map((member) => ({
            ...member.user,       
            memberID: member.id,  
            labID: Number(labIdParam), 
          }));
      
        res.json(flattenedMembers);
        
    } catch (error) {
        console.error(`Error retrieving members list for lab ID ${labIdParam}:`, error);
        res.status(500).json({ error: 'Failed to retrieve simplified lab members list' });
    }
};


