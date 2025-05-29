import { Request, Response } from 'express';
import { prisma } from '../..';

/**
 * @swagger
 * /discussion/tags:
 *   get:
 *     summary: Get all available post tags (categories)
 *     tags: [Discussion Board]
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of post tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostTag'
 *       500:
 *         description: Server error
 */
export const getAllTags = async (req: Request, res: Response): Promise<void> => {
    try {
        const tags = await prisma.postTag.findMany();
        res.json(tags);
    } catch (error) {
        console.error('Error retrieving post tags:', error);
        res.status(500).json({ error: 'Failed to retrieve post tags' });
    }
};

/**
 * @swagger
 * /discussion/tags/{id}:
 *   get:
 *     summary: Get a post tag by ID
 *     tags: [Discussion Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the post tag to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved the post tag
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostTag'
 *       400:
 *         description: Invalid post tag ID
 *       404:
 *         description: Post tag not found
 *       500:
 *         description: Server error
 */
export const getTagById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid post tag ID' });
            return;
        }
        const tag = await prisma.postTag.findUnique({ where: { id } });
        if (!tag) {
            res.status(404).json({ error: 'Post tag not found' });
            return;
        }
        res.json(tag);
    } catch (error) {
        console.error('Error retrieving post tag:', error);
        res.status(500).json({ error: 'Failed to retrieve post tag' });
    }
};

/**
 * @swagger
 * /discussion/tags:
 *   post:
 *     summary: Create a new post tag (category definition)
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
 *                 description: The name of the new tag
 *               description:
 *                 type: string
 *                 description: An optional description for the tag
 *             required:
 *               - tag
 *     responses:
 *       201:
 *         description: Post tag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostTag'
 *       400:
 *         description: Invalid input (e.g., missing tag name)
 *       500:
 *         description: Server error
 */
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


/**
 * @swagger
 * /discussion/tags/{id}:
 *   put:
 *     summary: Edit an existing post tag (category definition)
 *     tags: [Discussion Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the post tag to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tag:
 *                 type: string
 *                 description: The updated name of the tag
 *               description:
 *                 type: string
 *                 description: The updated description for the tag
 *     responses:
 *       200:
 *         description: Successfully edited the post tag
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostTag'
 *       400:
 *         description: Invalid post tag ID or input
 *       404:
 *         description: Post tag not found
 *       500:
 *         description: Server error
 */
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


/**
 * @swagger
 * /discussion/tags/{id}:
 *   delete:
 *     summary: Delete a post tag (category definition) by ID
 *     tags: [Discussion Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the post tag to delete
 *     responses:
 *       200:
 *         description: Successfully deleted the post tag
 *       400:
 *         description: Invalid post tag ID
 *       404:
 *         description: Post tag not found
 *       500:
 *         description: Server error
 */
export const deleteTag = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid post tag ID' });
            return;
        }

        const existingTag = await prisma.postTag.findUnique({ where: { id } });
        if (!existingTag) {
            res.status(404).json({ error: 'Post tag not found' });
            return;
        }

        await prisma.postTag.delete({ where: { id } });
        res.status(200).json({ message: 'Post tag deleted successfully' });
    } catch (error) {
        console.error('Error deleting post tag:', error);
        res.status(500).json({ error: 'Failed to delete post tag' });
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

/*
 *      Get Posts By Tag for Lab
 *
 *    Parameters:
 *      tagId: number
 *      labId?: number (optional query parameter)
 * 
 *    200:
 *      - Successfully found posts with the tag, optionally filtered by lab
 *    400:
 *      - Failed to parse tag ID from request parameters
 *    500:
 *      - Internal server error, unable to retrieve posts     
 */ 
export const getPostsByTagForLab = async (req: Request, res: Response): Promise<void> => {
    try {
        const tagId = parseInt(req.params.tagId, 10);
        const labId = req.query.labId ? parseInt(req.query.labId as string, 10) : undefined;

        if (isNaN(tagId)) {
            res.status(400).json({ error: 'Invalid tag ID' });
            return;
        }

        const whereClause: any = {
            tags: {
                some: {
                    postTagId: tagId
                }
            }
        };

        // Add lab filter if provided
        if (labId) {
            whereClause.discussion = {
                labId: labId
            };
        }

        const posts = await prisma.discussionPost.findMany({
            where: whereClause,
            include: {
                discussion: true,
                tags: {
                    include: {
                        postTag: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(posts);
    } catch (error) {
        console.error('Error retrieving posts by tag for lab:', error);
        res.status(500).json({ error: 'Failed to retrieve posts by tag for lab' });
    }
};

/*
 *      Get Tags Used in Lab
 *
 *    Parameters:
 *      labId?: number (optional query parameter)
 * 
 *    200:
 *      - Successfully retrieved tags used in the lab
 *    500:
 *      - Internal server error     
 */ 
export const getTagsUsedInLab = async (req: Request, res: Response): Promise<void> => {
    try {
        const labId = req.query.labId ? parseInt(req.query.labId as string, 10) : undefined;

        if (labId) {
            // Get tags that are actually used in posts for this lab
            const tags = await prisma.postTag.findMany({
                where: {
                    postTags: {
                        some: {
                            post: {
                                discussion: {
                                    labId: labId
                                }
                            }
                        }
                    }
                },
                include: {
                    _count: {
                        select: {
                            postTags: {
                                where: {
                                    post: {
                                        discussion: {
                                            labId: labId
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            res.json(tags);
        } else {
            // Return all tags if no lab filter
            const tags = await prisma.postTag.findMany();
            res.json(tags);
        }
    } catch (error) {
        console.error('Error retrieving tags for lab:', error);
        res.status(500).json({ error: 'Failed to retrieve tags for lab' });
    }
};