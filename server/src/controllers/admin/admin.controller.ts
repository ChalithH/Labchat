import { Request, Response } from 'express';
import { Event, Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// get all labs GET
export const getAllLabs = async (req: Request, res: Response) => {
    try {
        const labs = await prisma.lab.findMany();
        res.status(200).json(labs);
    } catch (error) {
        console.error('Error fetching labs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// get lab by id GET
export const getLabById = async (req: Request, res: Response) => {
    const labId = parseInt(req.params.id);
    if (isNaN(labId)) {
        return res.status(400).json({ error: 'Invalid lab ID' });
    }
    try {
        const lab = await prisma.lab.findUnique({
            where: { id: labId }
        });
        if (!lab) {
            return res.status(404).json({ error: 'Lab not found' });
        }
        res.status(200).json(lab);
    } catch (error) {
        console.error('Error fetching lab:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Admin:

// Create a new lab POST
export const createLab = async (req: Request, res: Response) => {
    const { name, location } = req.body;
    try {
        const newLab = await prisma.lab.create({
            data: {
                name,
                location,
                status: 'active',
            },
        });
        res.status(201).json(newLab);
    } catch (error) {
        console.error('Error creating lab:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Assign a user to a lab (regular or manager) POST
const assignUserToLab = async (req: Request, res: Response) => {
    const { labId, userId, role } = req.body;
    try {
        const lab = await prisma.lab.findUnique({
            where: { id: labId }
        });
        if (!lab) {
            return res.status(404).json({ error: 'Lab not found' });
        }
        const userExists = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (userExists) {
            return res.status(400).json({ error: 'User does not exist' });
        }

        const userInLab = await prisma.labMember.findFirst({
            where: {
                labId: labId,
                userId: userId
            }
        });

        if (userInLab) {
            return res.status(409).json({ error: 'User already in lab' });
        }

        const labMember = await prisma.labMember.create({
            data: {
                labId,
                userId,
                labRoleId: role, 
            }
        });
        res.status(201).json(labMember);

    } catch (error) {
        console.error('Error assigning user to lab:', error);
        res.status(500).json({ error: 'Internal server error' });
    }}

// Change user role PUT
export const promoteLabManager = async (req: Request, res: Response) => {
    const { labId, userId, role } = req.body;
    try {
        const lab = await prisma.lab.findUnique({
            where: { id: labId }
        });
        if (!lab) {
            return res.status(404).json({ error: 'Lab not found' });
        }
        const userExists = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (userExists) {
            return res.status(404).json({ error: 'User does not exist' });
        }

        const userInLab = await prisma.labMember.findFirst({
            where: {
                labId: labId,
                userId: userId
            }
        });

        if (!userInLab) {
            return res.status(404).json({ error: 'User not in lab' });
        }

        const labMember = await prisma.labMember.update({
            where: {
                id: userInLab.id
            },
            data: {
                labRoleId: role, 
            }
        });
        res.status(201).json(labMember);
    } catch (error) {
        console.error('Error promoting lab manager:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Reset user password POST
export const resetUserPassword = async (req: Request, res: Response) => {
    const { userId, newPassword } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                loginPassword: newPassword // Hash the password before saving
            }
        });
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error resetting user password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Lab Mangers:

//Remove members from a lab POST
export const removeUserFromLab = async (req: Request, res: Response) => {
    const { labId, userId } = req.body;
    try {
        const lab = await prisma.lab.findUnique({
            where: { id: labId }
        });
        if (!lab) {
            return res.status(404).json({ error: 'Lab not found' });
        }
        const userInLab = await prisma.labMember.findFirst({
            where: {
                labId: labId,
                userId: userId
            }
        });

        if (!userInLab) {
            return res.status(404).json({ error: 'User not in lab' });
        }

        await prisma.labMember.delete({
            where: {
                id: userInLab.id
            }
        });
        res.status(200).json({ message: 'User removed from lab' });
    } catch (error) {
        console.error('Error removing user from lab:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Create new tags for discussion POST
export const createDiscussionTag = async (req: Request, res: Response) => {
    const { tag, description } = req.body;
    try {
        const newTag = await prisma.postTag.create({
            data: {
                tag,
                description,
            },
        });
        res.status(201).json(newTag);
    } catch (error) {
        console.error('Error creating discussion tag:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Create new categories for discussion POST
export const createDiscussionCategory = async (req: Request, res: Response) => {
    const { labId, name, description } = req.body;

    try {
        const lab = await prisma.lab.findUnique({
            where: { id: labId }
        });
        if (!lab) {
            return res.status(404).json({ error: 'Lab not found' });
        }

        const newCategory = await prisma.discussion.create({
            data: {
                labId,
                name,
                description,
            },
        });
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating discussion category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Create new tags for inventory POST
export const createInventoryTag = async (req: Request, res: Response) => {
    const { name, tagDescription } = req.body;
    try {
        const newTag = await prisma.itemTag.create({
            data: {
                name,
                tagDescription,
            },
        });
        res.status(201).json(newTag);
    } catch (error) {
        console.error('Error creating inventory tag:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Create new items for inventory POST
export const createInventoryItem = async (req: Request, res: Response) => {
    const { itemId, labId, location, itemUnit, currentStock, minStock } = req.body;
    try {
        const newItem = await prisma.labInventoryItem.create({
            data: {
                itemId,
                labId,
                location,
                itemUnit,
                currentStock,
                minStock
            },
        });
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error creating inventory item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}