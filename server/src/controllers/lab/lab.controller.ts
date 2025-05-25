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
 *     summary: Get all members of a lab with user and membership details flattened
 *     tags: [Lab]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab
 *     responses:
 *       200:
 *         description: A list of lab members with flattened user and status data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LabMember'
 *       500:
 *         description: Internal server error
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


/**
 * @swagger
 * /lab/getMembersList/{labId}:
 *   get:
 *     summary: Get all members of a lab with user and membership details flattened
 *     tags: [Lab]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab
 *     responses:
 *       200:
 *         description: A list of lab members with flattened user and status data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LabMember'
 *       500:
 *         description: Internal server error
 */

export const getLabMembersList = async (req: Request, res: Response): Promise<void> => {
    const labId = req.params.labId; // Assuming labId is passed as a URL parameter
    try {
        const labMembers = await prisma.labMember.findMany({
            where: { labId: Number(labId) },
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

        const flattenedMembers = labMembers.map((member) => ({
            ...member.user,
            memberID: member.id,
            labID: labId,
          }));
      
        res.json(flattenedMembers);
        
    } catch (error) {
        console.error("Error retrieving lab info:", error);
        res.status(500).json({ error: 'Failed to retrieve info' });
    }
};

/**
 * @swagger
 * /lab/roles:
 *   get:
 *     summary: Get all lab roles
 *     description: Retrieve all available lab roles ordered by permission level (ascending). Used for admission requests and role assignments.
 *     tags: [Lab]
 *     responses:
 *       200:
 *         description: List of lab roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Unique identifier for the lab role
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: Name of the lab role
 *                     example: "Research Assistant"
 *                   description:
 *                     type: string
 *                     nullable: true
 *                     description: Detailed description of the role
 *                     example: "Assists with research activities and data collection"
 *                   permissionLevel:
 *                     type: integer
 *                     description: Permission level of the role (lower numbers = higher permissions)
 *                     example: 3
 *             example:
 *               - id: 1
 *                 name: "Lab Manager"
 *                 description: "Manages lab operations and supervises staff"
 *                 permissionLevel: 1
 *               - id: 2
 *                 name: "Senior Researcher"
 *                 description: "Leads research projects and mentors junior staff"
 *                 permissionLevel: 2
 *               - id: 3
 *                 name: "Research Assistant"
 *                 description: "Assists with research activities and data collection"
 *                 permissionLevel: 3
 *               - id: 4
 *                 name: "Student"
 *                 description: "Undergraduate or graduate student researcher"
 *                 permissionLevel: 4
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve lab roles"
 */
export const getLabRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await prisma.labRole.findMany({
      orderBy: { permissionLevel: 'asc' },
      take: 3, 
    });
    res.json(roles);
  } catch (error) {
    console.error("Error retrieving lab roles:", error);
    res.status(500).json({ error: 'Failed to retrieve lab roles' });
  }
};

/**
 * @swagger
 * /lab/all:
 *   get:
 *     summary: Get all labs
 *     description: Retrieve all available labs with basic information. Used for displaying lab listings and admission request options.
 *     tags: [Lab]
 *     responses:
 *       200:
 *         description: List of all labs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Unique identifier for the lab
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: Name of the lab
 *                     example: "Molecular Biology Lab"
 *                   location:
 *                     type: string
 *                     description: Physical location of the lab
 *                     example: "Building A, Room 203"
 *                   status:
 *                     type: string
 *                     description: Current operational status of the lab
 *                     example: "Active"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Date and time when the lab was created
 *                     example: "2024-01-15T08:30:00.000Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Date and time when the lab was last updated
 *                     example: "2024-12-01T14:20:00.000Z"
 *             example:
 *               - id: 1
 *                 name: "Molecular Biology Lab"
 *                 location: "Building A, Room 203"
 *                 status: "Active"
 *                 createdAt: "2024-01-15T08:30:00.000Z"
 *                 updatedAt: "2024-12-01T14:20:00.000Z"
 *               - id: 2
 *                 name: "Chemistry Research Lab"
 *                 location: "Building B, Room 105"
 *                 status: "Active"
 *                 createdAt: "2024-02-10T10:15:00.000Z"
 *                 updatedAt: "2024-11-28T16:45:00.000Z"
 *               - id: 3
 *                 name: "Physics Lab"
 *                 location: "Building C, Room 301"
 *                 status: "Maintenance"
 *                 createdAt: "2024-03-01T09:00:00.000Z"
 *                 updatedAt: "2024-12-05T11:30:00.000Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve labs"
 */
export const getAllLabs = async (req: Request, res: Response): Promise<void> => {
  try {
    const labs = await prisma.lab.findMany();
    res.json(labs);
  } catch (error) {
    console.error("Error retrieving labs:", error);
    res.status(500).json({ error: 'Failed to retrieve labs' });
  }
}

/**
 * @swagger
 * /lab/user/{userId}/labs:
 *   get:
 *     summary: Get user's lab memberships
 *     description: Retrieve the lab IDs where the user is currently a member. Used to determine which labs a user belongs to for admission request filtering.
 *     tags: [Lab]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to get lab memberships for
 *         example: 5
 *     responses:
 *       200:
 *         description: User's lab memberships retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   labId:
 *                     type: integer
 *                     description: ID of the lab where user is a member
 *                     example: 1
 *             example:
 *               - labId: 1
 *               - labId: 3
 *               - labId: 5
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to update user"
 */
export const getUserLabs = async (req: Request, res: Response): Promise<void> => { 
   try {  
    const { userId } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Fetch user's lab memberships
    const memberships = await prisma.labMember.findMany({
      where: { userId: Number(userId) },
      select : { labId: true }
      })
      
    res.json(memberships);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to update user' });
  };
}