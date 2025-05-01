import { Request, Response } from 'express';
import { prisma } from '../..';

/**
 * @swagger
 * /discussion/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Discussion Board]
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DiscussionPostTag'
 *       500:
 *         description: Server error
 */
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await prisma.discussionPostTag.findMany();
        res.json(categories);
    } catch (error) {
        console.error('Error retrieving categories:', error);
        res.status(500).json({ error: 'Failed to retrieve categories' });
    }
};

/**
 * @swagger
 * /discussion/category/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Discussion Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved the category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscussionPostTag'
 *       400:
 *         description: Invalid category ID
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid category ID' });
            return;
        }
        const category = await prisma.discussionPostTag.findUnique({ where: { id } });
        if (!category) {
            res.status(404).json({ error: 'Category not found' });
            return;
        }
        res.json(category);
    } catch (error) {
        console.error('Error retrieving category:', error);
        res.status(500).json({ error: 'Failed to retrieve category' });
    }
};

/**
 * @swagger
 * /discussion/category:
 *   post:
 *     summary: Create a new category
 *     tags: [Discussion Board]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tag:
 *                 type: string
 *               postId:
 *                 type: number
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tag, postId } = req.body;
        if (!tag || !postId) {
            res.status(400).json({ error: 'Tag and postId are required' });
            return;
        }

        const newCategory = await prisma.discussionPostTag.create({
            data: {
                tag,
                postId,
            },
        });
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
};


/**
 * @swagger
 * /discussion/category/{id}:
 *   put:
 *     summary: Edit an existing category
 *     tags: [Discussion Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tag:
 *                 type: string
 *               postId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successfully edited the category
 *       400:
 *         description: Invalid category ID or input
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
export const editCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid category ID' });
            return;
        }

        const { tag, postId } = req.body;
        const updatedCategory = await prisma.discussionPostTag.update({
            where: { id },
            data: {
                tag,
                postId,
            },
        });
        res.json(updatedCategory);
    } catch (error) {
        console.error('Error editing category:', error);
        res.status(500).json({ error: 'Failed to edit category' });
    }
};


/**
 * @swagger
 * /discussion/category/{id}:
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Discussion Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted the category
 *       400:
 *         description: Invalid category ID
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid category ID' });
            return;
        }
        const category = await prisma.discussionPostTag.findUnique({ where: { id } });
        if (!category) {
            res.status(404).json({ error: 'Category not found' });
            return;
        }

        await prisma.discussionPostTag.delete({ where: { id } });
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
};
