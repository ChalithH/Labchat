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


export const createTag = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tag, description } = req.body;
        if (!tag || typeof tag !== 'string') {
            res.status(400).json({ error: 'Valid tag name is required' });
            return;
        }

        const newTag = await prisma.postTag.create({
            data: {
                tag,
                description: description || null,
            },
        });
        res.status(201).json(newTag);
    } catch (error) {
        console.error('Error creating post tag:', error);
        res.status(500).json({ error: 'Failed to create post tag' });
    }
};















// All below need to be changed to Discussion model not Tag model


export const editTag = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid post tag ID' });
            return;
        }

        const { tag, description } = req.body;
        if (!tag || typeof tag !== 'string') {
            res.status(400).json({ error: 'Valid tag name is required' });
            return;
        }

        const updatedTag = await prisma.postTag.update({
            where: { id },
            data: {
                tag,
                description: description || null,
            },
        });
        res.json(updatedTag);
    } catch (error) {
        console.error('Error editing post tag:', error);
        res.status(500).json({ error: 'Failed to edit post tag' });
    }
};
// --- Functions for assigning tags to posts (using DiscussionPostTag) ---

/**
 * @swagger
 * /discussion/posts/{postId}/tags:
 *   post:
 *     summary: Assign a tag to a discussion post
 *     tags: [Discussion Board]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the discussion post to tag
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postTagId:
 *                 type: integer
 *                 description: The ID of the tag to assign
 *             required:
 *               - postTagId
 *     responses:
 *       201:
 *         description: Tag assigned to post successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscussionPostTag'
 *       400:
 *         description: Invalid input (e.g., missing postTagId) or invalid IDs
 *       404:
 *         description: Post or Tag not found
 *       409:
 *         description: Tag is already assigned to this post
 *       500:
 *         description: Server error
 */
export const assignTagToPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = parseInt(req.params.postId, 10);
        const { postTagId } = req.body;

        if (isNaN(postId) || !postTagId || typeof postTagId !== 'number') {
            res.status(400).json({ error: 'Invalid postId or postTagId' });
            return;
        }

        const post = await prisma.discussionPost.findUnique({ where: { id: postId } });
        if (!post) {
            res.status(404).json({ error: 'Discussion post not found' });
            return;
        }
        const tag = await prisma.postTag.findUnique({ where: { id: postTagId } });
        if (!tag) {
            res.status(404).json({ error: 'Post tag not found' });
            return;
        }

        const newAssignment = await prisma.discussionPostTag.create({
            data: {
                postId: postId,
                postTagId: postTagId,
            },
        });

        res.status(201).json(newAssignment);
    } catch (error) {
        console.error('Error assigning tag to post:', error);
        res.status(500).json({ error: 'Failed to assign tag to post' });
    }
};

/**
 * @swagger
 * /discussion/posts/{postId}/tags/{tagAssignmentId}:
 *   delete:
 *     summary: Remove a tag assignment from a discussion post
 *     tags: [Discussion Board]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the discussion post
 *       - in: path
 *         name: tagAssignmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the tag assignment record (DiscussionPostTag ID)
 *     responses:
 *       200:
 *         description: Tag assignment removed successfully
 *       400:
 *         description: Invalid postId or tagAssignmentId
 *       404:
 *         description: Tag assignment not found for this post
 *       500:
 *         description: Server error
 */
export const removeTagFromPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = parseInt(req.params.postId, 10);
        const tagAssignmentId = parseInt(req.params.tagAssignmentId, 10);

        if (isNaN(postId) || isNaN(tagAssignmentId)) {
            res.status(400).json({ error: 'Invalid postId or tagAssignmentId' });
            return;
        }

        const deletedAssignment = await prisma.discussionPostTag.delete({
            where: {
                id: tagAssignmentId,
                postId: postId,
            },
        });

        res.status(200).json({ message: 'Tag assignment removed successfully', deletedAssignmentId: deletedAssignment.id });
    } catch (error) {
        console.error('Error removing tag from post:', error);
        res.status(500).json({ error: 'Failed to remove tag from post' });
    }
};