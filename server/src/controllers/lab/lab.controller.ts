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
            where: { 
                labId: Number(labId),
                labRole: { permissionLevel: { gte: 0 } } // Only active members
            },
            select: {
                id: true,
                userId: true,
                labId: true,
                labRoleId: true,
                inductionDone: true,
                isPCI: true,
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
                        contact: {
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

        const formattedMembers = labMembersFromDb.map((member) => {
            const userData = member.user ? {
                id: member.user.id,
                firstName: member.user.firstName,
                lastName: member.user.lastName,
                displayName: member.user.displayName,
                jobTitle: member.user.jobTitle,
                office: member.user.office,
                bio: member.user.bio,
            } : {
                id: -1,
                firstName: 'Unknown',
                lastName: 'User',
                displayName: 'Unknown User (Data Issue)',
                jobTitle: null,
                office: null,
                bio: null,
            };

            return {
                ...userData,

                memberID: member.id,
                labID: member.labId,
                labRoleId: member.labRoleId,
                createdAt: member.createdAt,
                inductionDone: member.inductionDone,
                isPCI: member.isPCI,
                status: member.memberStatus,
            };
        });

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
            where: { 
                labId: Number(labIdParam),
                labRole: { permissionLevel: { gte: 0 } }
            },
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

/**
 * @swagger
 * /lab/roles:
 *   get:
 *     summary: Get available lab roles for admission requests
 *     description: Retrieve available lab roles ordered by permission level (ascending). Used for admission requests and role assignments. Excludes 'Former Member' role and other roles with permission level < 0.
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
      where: {
        permissionLevel: { gte: 0 } // Exclude Former Member and other negative permission roles
      },
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

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const memberships = await prisma.labMember.findMany({
      where: { 
        userId: Number(userId),
        labRole: { permissionLevel: { gte: 0 } } // Only active memberships
      },
      select : { labId: true }
      })
      
    res.json(memberships);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to update user' });
  };
}