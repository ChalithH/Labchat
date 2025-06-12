import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { PERMISSIONS } from '../../config/permissions';

const prisma = new PrismaClient();

/**
 * @swagger
 * /admin/get-lab-roles:
 *   get:
 *     summary: Get all lab roles
 *     description: Retrieves a list of all lab roles available in the system.
 *     tags: [Admin, LabRole]
 *     responses:
 *       200:
 *         description: List of lab roles fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LabRole' 
 *       500:
 *         description: Internal server error
 */
export const getAllLabRoles = async (req: Request, res: Response): Promise<void> => {
    try {
        const labRoles = await prisma.labRole.findMany();
        res.status(200).json(labRoles);
    } catch (error) {
        console.error('Error fetching lab roles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/create-lab-role:
 *   post:
 *     summary: Create a new lab role
 *     description: Creates a new lab role that will be available across all labs
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - permissionLevel
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the lab role
 *                 example: "Senior Technician"
 *               description:
 *                 type: string
 *                 description: Description of the lab role
 *                 example: "Experienced technician with advanced equipment knowledge"
 *               permissionLevel:
 *                 type: integer
 *                 description: Permission level of the role (higher numbers = more permissions)
 *                 example: 45
 *     responses:
 *       201:
 *         description: Lab role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the created lab role
 *                 name:
 *                   type: string
 *                   description: Name of the lab role
 *                 description:
 *                   type: string
 *                   description: Description of the lab role
 *                 permissionLevel:
 *                   type: integer
 *                   description: Permission level of the role
 *       400:
 *         description: Invalid input or role name already exists
 *       500:
 *         description: Internal server error
 */
export const createLabRole = async (req: Request, res: Response): Promise<void> => {
    const { name, description, permissionLevel } = req.body;
    const sessionUserId = (req.session as any)?.passport?.user;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'Role name is required and must be a non-empty string' });
        return;
    }

    if (permissionLevel === undefined || typeof permissionLevel !== 'number') {
        res.status(400).json({ error: 'Permission level is required and must be a number' });
        return;
    }

    // Validate permission level range (assumption: Permission level must be between 0 and 100)
    if (permissionLevel < 0 || permissionLevel > 100) {
        res.status(400).json({ error: `Permission level must be between 0 and 100` });
        return;
    }

    try {
        // Check if user has permission to create lab roles
        // Either global permission level 60+ OR be a lab manager in any lab
        const user = await prisma.user.findUnique({
            where: { id: sessionUserId },
            include: { 
                role: true,
                labMembers: {
                    include: {
                        labRole: true
                    }
                }
            }
        });

        if (!user || !user.role) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        
        const hasGlobalPermission = user.role.permissionLevel >= PERMISSIONS.GLOBAL_ADMIN;
        
        // Check if user is lab manager in any lab
        const isLabManager = user.labMembers.some(member => 
            member.labRole.permissionLevel >= PERMISSIONS.LAB_MANAGER
        );

        if (!hasGlobalPermission && !isLabManager) {
            res.status(403).json({ 
                error: 'Insufficient permissions. You must be a lab manager or have administrative privileges to create lab roles.' 
            });
            return;
        }

        // Check if a role with the same name already exists
        const existingRole = await prisma.labRole.findFirst({
            where: { name: name.trim() }
        });

        if (existingRole) {
            res.status(400).json({ error: 'A lab role with this name already exists' });
            return;
        }

        // Create the new lab role
        const newLabRole = await prisma.labRole.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                permissionLevel: permissionLevel
            }
        });

        res.status(201).json(newLabRole);
    } catch (error) {
        console.error('Error creating lab role:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                res.status(400).json({ error: 'A lab role with this name already exists' });
                return;
            }
        }
        res.status(500).json({ error: 'Internal server error while creating lab role' });
    }
};