import { Request, Response } from 'express';
import { PrismaClient, AdmissionStatus, MemberStatus } from '@prisma/client';


const prisma = new PrismaClient();

/**
 * @swagger
 * /labAdmission/request:
 *   post:
 *     summary: Create a new lab admission request
 *     description: Allow a user to request admission to a specific lab with a specific role
 *     tags: [Lab Admission]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - labId
 *               - userId
 *               - roleId
 *             properties:
 *               labId:
 *                 type: integer
 *                 description: ID of the lab to request admission to
 *               userId:
 *                 type: integer
 *                 description: ID of the user making the request
 *               roleId:
 *                 type: integer
 *                 description: ID of the lab role being requested
 *     responses:
 *       201:
 *         description: Admission request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 labId:
 *                   type: integer
 *                 userId:
 *                   type: integer
 *                 roleId:
 *                   type: integer
 *                 status:
 *                   type: string
 *                   enum: [PENDING, APPROVED, REJECTED, WITHDRAWN]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - missing required fields or user already has pending/approved request
 *       404:
 *         description: Lab, user, or role not found
 *       500:
 *         description: Internal server error
 */
export const createAdmissionRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { labId, userId, roleId } = req.body;

        // Validate required fields
        if (!labId || !userId || !roleId) {
            res.status(400).json({ 
                error: 'Missing required fields: labId, userId, and roleId are required' 
            });
            return;
        }

        // Check if lab exists
        const lab = await prisma.lab.findUnique({
            where: { id: Number(labId) }
        });

        if (!lab) {
            res.status(404).json({ error: 'Lab not found' });
            return;
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Check if role exists
        const role = await prisma.labRole.findUnique({
            where: { id: Number(roleId) }
        });

        if (!role) {
            res.status(404).json({ error: 'Lab role not found' });
            return;
        }

        // Check if user is already an active member of this lab
        const existingActiveMember = await prisma.labMember.findFirst({
            where: {
                userId: Number(userId),
                labId: Number(labId),
                labRole: {
                    permissionLevel: {
                        gte: 0 // Only check for active members (permission level >= 0)
                    }
                }
            }
        });

        if (existingActiveMember) {
            res.status(400).json({ error: 'User is already an active member of this lab' });
            return;
        }

        // Check if user already has a pending or approved admission request
        const existingRequest = await prisma.labAdmission.findFirst({
            where: {
                userId: Number(userId),
                labId: Number(labId),
                status: {
                    in: [AdmissionStatus.PENDING, AdmissionStatus.APPROVED]
                }
            }
        });

        if (existingRequest) {
            res.status(400).json({ 
                error: `User already has a ${existingRequest.status.toLowerCase()} admission request for this lab` 
            });
            return;
        }

        // Create the admission request
        const admissionRequest = await prisma.labAdmission.create({
            data: {
                labId: Number(labId),
                userId: Number(userId),
                roleId: Number(roleId),
                status: AdmissionStatus.PENDING
            },
            include: {
                lab: {
                    select: {
                        name: true,
                        location: true
                    }
                },
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        displayName: true, 
                    }
                },
                role: {
                    select: {
                        name: true,
                        description: true
                    }
                }
            }
        });

        res.status(201).json(admissionRequest);

    } catch (error) {
        console.error("Error creating admission request:", error);
        res.status(500).json({ error: 'Failed to create admission request' });
    }
};

/**
 * @swagger
 * /labAdmission/approve/{admissionId}:
 *   put:
 *     summary: Approve a lab admission request and create lab member
 *     description: Approve an admission request and automatically create a lab member with the requested role
 *     tags: [Lab Admission]
 *     parameters:
 *       - in: path
 *         name: admissionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the admission request to approve
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *             properties:
 *               roleId:
 *                 type: integer
 *                 description: ID of the lab role to assign to the user (must be a valid lab role)
 *                 example: 3
 *               isPCI:
 *                 type: boolean
 *                 description: Whether this approval is for a Principal Investigator Contact role
 *                 example: false
 *                 default: false
 *     responses:
 *       200:
 *         description: Admission approved and lab member created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 admissionRequest:
 *                   type: object
 *                 labMember:
 *                   type: object
 *       400:
 *         description: Bad request - admission request not in pending status
 *       404:
 *         description: Admission request not found
 *       500:
 *         description: Internal server error
 */
export const approveAdmissionRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { admissionId } = req.params;
        const { roleId, isPCI } = req.body;

        // Find the admission request
        const admissionRequest = await prisma.labAdmission.findUnique({
            where: { id: Number(admissionId) },
            include: {
                user: true,
                lab: true,
                role: true
            }
        });

        if (!admissionRequest) {
            res.status(404).json({ error: 'Admission request not found' });
            return;
        } 

        // Check if the request is in pending status
        if (admissionRequest.status !== AdmissionStatus.PENDING) {
            res.status(400).json({ 
                error: `Cannot approve admission request with status: ${admissionRequest.status}` 
            });
            return;
        }

        // Check if user is already a member (safety check)
        const existingMember = await prisma.labMember.findFirst({
            where: {
                userId: admissionRequest.userId,
                labId: admissionRequest.labId
            }
        });

        if (existingMember) {
            // Check if it's a former member that can be reactivated
            const formerMember = await prisma.labMember.findFirst({
                where: {
                    userId: admissionRequest.userId,
                    labId: admissionRequest.labId,
                    labRole: {
                        permissionLevel: -1 // Former member (with lab role = 'Former Member')
                    }
                }
            });

            if (!formerMember) {
                res.status(400).json({ error: 'User is already an active member of this lab' });
                return;
            }
        }

        const userFirstContact = await prisma.contact.findFirst({
            where: { 
                userId: admissionRequest.userId,
            },
            orderBy: { id: 'asc' } 
        });

        if (!userFirstContact) {
            res.status(400).json({ error: 'User has no contact information' });
            return;
        }

        // Check if user is a former member
        const formerMember = await prisma.labMember.findFirst({
            where: {
                userId: admissionRequest.userId,
                labId: admissionRequest.labId,
                labRole: {
                    permissionLevel: -1 
                }
            }
        });

        // Use transaction to ensure both operations succeed or fail together
        const result = await prisma.$transaction(async (tx) => {
            // Update admission request status to APPROVED
            const updatedAdmission = await tx.labAdmission.update({
                where: { id: Number(admissionId) },
                data: { 
                    roleId: roleId,
                    isPCI: isPCI,
                    status: AdmissionStatus.APPROVED,
                    updatedAt: new Date()
                },
                include: {
                    lab: {
                        select: {
                            name: true,
                            location: true
                        }
                    },
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            displayName: true
                        }
                    },
                    role: {
                        select: {
                            name: true,
                            description: true
                        }
                    }
                }
            });

            let labMember;
            let isReactivated = false;

            if (formerMember) {
                // Reactivate former member by updating their role
                labMember = await tx.labMember.update({
                    where: { id: formerMember.id },
                    data: {
                        labRoleId: roleId,
                        isPCI: isPCI,
                        updatedAt: new Date()
                    },
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                displayName: true
                            }
                        },
                        lab: {
                            select: {
                                name: true,
                                location: true
                            }
                        },
                        labRole: {
                            select: {
                                name: true,
                                description: true
                            }
                        }
                    }
                });
                isReactivated = true;
            } else {
                // Create new lab member
                labMember = await tx.labMember.create({
                    data: {
                        userId: admissionRequest.userId,
                        labId: admissionRequest.labId,
                        labRoleId: roleId,
                        isPCI: isPCI,
                    },
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                displayName: true
                            }
                        },
                        lab: {
                            select: {
                                name: true,
                                location: true
                            }
                        },
                        labRole: {
                            select: {
                                name: true,
                                description: true
                            }
                        }
                    }
                });
            }

            // Create default member statuses only for new members (not reactivated ones)
            if (!isReactivated) {
                const onlineStatus = await tx.memberStatus.create({
                    data: {
                        description: 'Default online status',
                        contactId: userFirstContact.id,
                        memberId: labMember.id,
                        isActive: false,
                        statusId: 1, 
                    }
                });
                
                const offlineStatus = await tx.memberStatus.create({
                    data: {
                        description: 'Default offline status',
                        contactId: userFirstContact.id,
                        memberId: labMember.id,
                        isActive: true,
                        statusId: 3, 
                    }
                });
            }

            const updatedRoleID = existingMember || (admissionRequest.user.roleId === 1) ? admissionRequest.user.roleId : 3; 
            
            let updatedUser = null;
            if (!admissionRequest.user.lastViewedLabId) {
                updatedUser = await tx.user.update({
                    where: { id: admissionRequest.userId },
                    data: {
                        roleId: updatedRoleID,
                        lastViewedLabId: admissionRequest.labId,
                        lastViewed: `/dashboard` // or '/dashboard'
                    }
                });
            }

            return { updatedAdmission, newLabMember: labMember, isReactivated };
        });

        res.status(200).json({
            message: result.isReactivated 
                ? 'Admission request approved and user reactivated successfully' 
                : 'Admission request approved and lab member created successfully',
            admissionRequest: result.updatedAdmission,
            labMember: result.newLabMember,
            isReactivated: result.isReactivated
        });

    } catch (error) {
        console.error("Error approving admission request:", error);
        res.status(500).json({ error: error});
    }
};

/**
 * @swagger
 * /labAdmission/reject/{admissionId}:
 *   put:
 *     summary: Reject a lab admission request
 *     description: Change the status of a pending admission request to rejected
 *     tags: [Lab Admission]
 *     parameters:
 *       - in: path
 *         name: admissionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the admission request to reject
 *     responses:
 *       200:
 *         description: Admission request rejected successfully
 *       400:
 *         description: Bad request - admission request not in pending status
 *       404:
 *         description: Admission request not found
 *       500:
 *         description: Internal server error
 */
export const rejectAdmissionRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { admissionId } = req.params;

        // Find the admission request
        const admissionRequest = await prisma.labAdmission.findUnique({
            where: { id: Number(admissionId) }
        });

        if (!admissionRequest) {
            res.status(404).json({ error: 'Admission request not found' });
            return;
        }

        // Check if the request is in pending status
        if (admissionRequest.status !== AdmissionStatus.PENDING) {
            res.status(400).json({ 
                error: `Cannot reject admission request with status: ${admissionRequest.status}` 
            });
            return;
        }

        // Update admission request status to REJECTED
        const updatedAdmission = await prisma.labAdmission.update({
            where: { id: Number(admissionId) },
            data: { 
                status: AdmissionStatus.REJECTED,
                updatedAt: new Date()
            },
            include: {
                lab: {
                    select: {
                        name: true,
                        location: true
                    }
                },
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        displayName: true
                    }
                },
                role: {
                    select: {
                        name: true,
                        description: true
                    }
                }
            }
        });

        res.status(200).json({
            message: 'Admission request rejected successfully',
            admissionRequest: updatedAdmission
        });

    } catch (error) {
        console.error("Error rejecting admission request:", error);
        res.status(500).json({ error: 'Failed to reject admission request' });
    }
};

/**
 * @swagger
 * /labAdmission/withdraw/{admissionId}:
 *   put:
 *     summary: Withdraw a lab admission request
 *     description: Allow a user to withdraw their own pending admission request
 *     tags: [Lab Admission]
 *     parameters:
 *       - in: path
 *         name: admissionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the admission request to withdraw
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user withdrawing the request
 *     responses:
 *       200:
 *         description: Admission request withdrawn successfully
 *       400:
 *         description: Bad request - not authorized to withdraw or invalid status
 *       404:
 *         description: Admission request not found
 *       500:
 *         description: Internal server error
 */
export const withdrawAdmissionRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { admissionId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            res.status(400).json({ error: 'userId is required' });
            return;
        }

        // Find the admission request
        const admissionRequest = await prisma.labAdmission.findUnique({
            where: { id: Number(admissionId) }
        });

        if (!admissionRequest) {
            res.status(404).json({ error: 'Admission request not found' });
            return;
        }

        // Check if the user is authorized to withdraw this request
        if (admissionRequest.userId !== Number(userId)) {
            res.status(400).json({ error: 'Not authorized to withdraw this admission request' });
            return;
        }

        // Check if the request is in pending status
        if (admissionRequest.status !== AdmissionStatus.PENDING) {
            res.status(400).json({ 
                error: `Cannot withdraw admission request with status: ${admissionRequest.status}` 
            });
            return;
        }

        // Update admission request status to WITHDRAWN
        const updatedAdmission = await prisma.labAdmission.update({
            where: { id: Number(admissionId) },
            data: { 
                status: AdmissionStatus.WITHDRAWN,
                updatedAt: new Date()
            },
            include: {
                lab: {
                    select: {
                        name: true,
                        location: true
                    }
                },
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        displayName: true
                    }
                },
                role: {
                    select: {
                        name: true,
                        description: true
                    }
                }
            }
        });

        res.status(200).json({
            message: 'Admission request withdrawn successfully',
            admissionRequest: updatedAdmission
        });

    } catch (error) {
        console.error("Error withdrawing admission request:", error);
        res.status(500).json({ error: 'Failed to withdraw admission request' });
    }
};

/**
 * @swagger
 * /labAdmission/lab/{labId}:
 *   get:
 *     summary: Get all admission requests for a specific lab
 *     description: Retrieve all admission requests for a lab, optionally filtered by status
 *     tags: [Lab Admission]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab
 *     responses:
 *       200:
 *         description: List of admission requests retrieved successfully
 *       404:
 *         description: Lab not found
 *       500:
 *         description: Internal server error
 */
export const getLabAdmissionRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const { labId } = req.params;
        const lab = await prisma.lab.findUnique({
            where: { id: Number(labId) }
        });
 
        if (!lab) {
            res.status(404).json({ error: 'Lab not found' });
            return;
        }
 
        const whereClause: any = { labId: Number(labId) };
 
        const admissionRequests = await prisma.labAdmission.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        displayName: true,
                        jobTitle: true,
                        office: true,
                        profilePic: true,
                    }
                },
                role: {
                    select: {
                        name: true,
                        description: true,
                        permissionLevel: true
                    }
                },
                lab: {
                     select: {
                        name: true,
                        location: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
 
        res.status(200).json(admissionRequests);
     } catch (error) {
        console.error("Error retrieving lab admission requests:", error);
        res.status(500).json({ error: 'Failed to retrieve admission requests' });
    }
};


/**
 * @swagger
 * /labAdmission/user/{userId}:
 *   get:
 *     summary: Get admission requests for a specific user
 *     description: Retrieve all admission requests made by a specific user, including user details, requested role, and lab information.
 *     tags: [Lab Admission]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to get admission requests for
 *         example: 5
 *     responses:
 *       200:
 *         description: User's admission requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Admission request ID
 *                     example: 25
 *                   labId:
 *                     type: integer
 *                     description: ID of the requested lab
 *                     example: 1
 *                   userId:
 *                     type: integer
 *                     description: ID of the requesting user
 *                     example: 5
 *                   roleId:
 *                     type: integer
 *                     nullable: true
 *                     description: ID of the requested role
 *                     example: 2
 *                   status:
 *                     type: string
 *                     enum: [PENDING, APPROVED, REJECTED, WITHDRAWN]
 *                     description: Current status of the admission request
 *                     example: "PENDING"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Date when request was submitted
 *                     example: "2024-12-01T14:20:00.000Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Date when request was last updated
 *                     example: "2024-12-01T14:20:00.000Z"
 *                   user:
 *                     type: object
 *                     properties:
 *                       firstName:
 *                         type: string
 *                         example: "John"
 *                       lastName:
 *                         type: string
 *                         example: "Doe"
 *                       displayName:
 *                         type: string
 *                         example: "John Doe"
 *                       jobTitle:
 *                         type: string
 *                         example: "Research Assistant"
 *                       office:
 *                         type: string
 *                         example: "Room 205"
 *                   role:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Student Researcher"
 *                       description:
 *                         type: string
 *                         example: "Student role for research activities"
 *                   lab:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Molecular Biology Lab"
 *                       location:
 *                         type: string
 *                         example: "Building A, Room 203"
 *             example:
 *               - id: 25
 *                 labId: 1
 *                 userId: 5
 *                 roleId: 2
 *                 status: "PENDING"
 *                 createdAt: "2024-12-01T14:20:00.000Z"
 *                 updatedAt: "2024-12-01T14:20:00.000Z"
 *                 user:
 *                   firstName: "John"
 *                   lastName: "Doe"
 *                   displayName: "John Doe"
 *                   jobTitle: "Research Assistant"
 *                   office: "Room 205"
 *                 role:
 *                   name: "Student Researcher"
 *                   description: "Student role for research activities"
 *                 lab:
 *                   name: "Molecular Biology Lab"
 *                   location: "Building A, Room 203"
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
 *                   example: "Failed to retrieve admission requests"
 */
export const getUserLabAdmissionRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ error: 'userId is required' });
            return;
        }
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Get user's admission requests
        const admissionRequests = await prisma.labAdmission.findMany({
            where: { userId: Number(userId) },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        displayName: true,
                        jobTitle: true,
                        office: true
                    }
                },
                role: {
                    select: {
                        name: true,
                        description: true
                    }
                },
                lab: { 
                    select: {
                        name: true,
                        location: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json(admissionRequests);

    } catch (error) {
        console.error("Error retrieving user admission requests:", error);
        res.status(500).json({ error: 'Failed to retrieve admission requests' });
    }
};


/**
 * @swagger
 * /labAdmission/removeMember:
 *   delete:
 *     summary: Remove a user from a lab
 *     description: Remove a lab member and optionally update their admission status. This will delete all related member data including status records.
 *     tags: [Lab Admission]
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
 *                 description: ID of the user to remove
 *               reason:
 *                 type: string
 *                 description: Optional reason for removal
 *     responses:
 *       200:
 *         description: User removed from lab successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 removedMember:
 *                   type: object
 *       400:
 *         description: Bad request - missing required fields
 *       404:
 *         description: Lab, user, or lab member not found
 *       500:
 *         description: Internal server error
 */
export const removeLabMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const { labId, userId, reason } = req.body;

        if (!labId || !userId) {
            res.status(400).json({ 
                error: 'Missing required fields: labId and userId are required' 
            });
            return;
        }

        const lab = await prisma.lab.findUnique({
            where: { id: Number(labId) }
        });

        if (!lab) {
            res.status(404).json({ error: 'Lab not found' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: Number(userId) }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const labMember = await prisma.labMember.findFirst({
            where: {
                labId: Number(labId),
                userId: Number(userId)
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        displayName: true
                    }
                },
                lab: {
                    select: {
                        name: true,
                        location: true
                    }
                },
                labRole: {
                    select: {
                        name: true,
                        description: true
                    }
                }
            }
        });

        if (!labMember) {
            res.status(404).json({ error: 'User is not a member of this lab' });
            return;
        }

        const result = await prisma.$transaction(async (tx) => {
            // Delete the lab member (this will cascade delete member status records due to onDelete: Cascade)
            const deletedMember = await tx.labMember.delete({
                where: { id: labMember.id },
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            displayName: true
                        }
                    },
                    lab: {
                        select: {
                            name: true,
                            location: true
                        }
                    },
                    labRole: {
                        select: {
                            name: true,
                            description: true
                        }
                    }
                }
            });

            // Note: We don't delete the admission record as it serves as historical data
            // But we could optionally add a "removed" status or timestamp if needed

            return { deletedMember };
        });

        res.status(200).json({
            message: 'User removed from lab successfully',
            removedMember: result.deletedMember,
            reason: reason || null
        });

    } catch (error) {
        console.error("Error removing lab member:", error);
        res.status(500).json({ error: 'Failed to remove lab member' });
    }
};

/**
 * @swagger
 * /labAdmission/removeMember/{memberId}:
 *   delete:
 *     summary: Remove a lab member by member ID
 *     description: Remove a lab member using their specific lab member ID. This is an alternative to the lab/user ID approach.
 *     tags: [Lab Admission]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the lab member record to remove
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Optional reason for removal
 *     responses:
 *       200:
 *         description: Lab member removed successfully
 *       404:
 *         description: Lab member not found
 *       500:
 *         description: Internal server error
 */
export const removeLabMemberById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { memberId } = req.params;
        const { reason } = req.body || {};

        // Find the lab member
        const labMember = await prisma.labMember.findUnique({
            where: { id: Number(memberId) },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        displayName: true
                    }
                },
                lab: {
                    select: {
                        name: true,
                        location: true
                    }
                },
                labRole: {
                    select: {
                        name: true,
                        description: true
                    }
                }
            }
        });

        if (!labMember) {
            res.status(404).json({ error: 'Lab member not found' });
            return;
        }

        // Delete the lab member
        const deletedMember = await prisma.labMember.delete({
            where: { id: Number(memberId) },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        displayName: true
                    }
                },
                lab: {
                    select: {
                        name: true,
                        location: true
                    }
                },
                labRole: {
                    select: {
                        name: true,
                        description: true
                    }
                }
            }
        });

        res.status(200).json({
            message: 'Lab member removed successfully',
            removedMember: deletedMember,
            reason: reason || null
        });

    } catch (error) {
        console.error("Error removing lab member by ID:", error);
        res.status(500).json({ error: 'Failed to remove lab member' });
    }
};