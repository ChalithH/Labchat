import { Request, Response } from 'express';
import { prisma } from '../..';


export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const tags = await prisma.discussion.findMany();
        res.json(tags);
    } catch (error) {
        console.error('Error retrieving discussion categories:', error);
        res.status(500).json({ error: 'Failed to retrieve discussion categories' });
    }
};

export const getAllCategoriesByLab = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10)
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid lab ID' })
            return
        }

        const lab = await prisma.lab.findUnique({ where: { id } })
        if (!lab) {
            res.status(404).json({ error: 'Lab not found' })
            return
        }

        const tags = await prisma.discussion.findMany({ where: { lab }})
        res.json(tags)
    } catch (error) {
        console.error('Error retrieving post tag:', error);
        res.status(500).json({ error: 'Failed to retrieve post tag' });
    }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid discussion category ID' });
            return;
        }
        const tag = await prisma.discussion.findUnique({ where: { id } });
        if (!tag) {
            res.status(404).json({ error: 'Discussion category not found' });
            return;
        }
        res.json(tag);
    } catch (error) {
        console.error('Error retrieving post tag:', error);
        res.status(500).json({ error: 'Failed to retrieve discussion category' });
    }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid post discussion category ID' });
            return;
        }

        const existingTag = await prisma.discussion.findUnique({ where: { id } });
        if (!existingTag) {
            res.status(404).json({ error: 'Discussion category not found' });
            return;
        }

        await prisma.postTag.delete({ where: { id } });
        res.status(200).json({ message: 'Discussion category deleted successfully' });
    } catch (error) {
        console.error('Error deleting discussion category:', error);
        res.status(500).json({ error: 'Failed to delete discussion category' });
    }
};