import { Request, Response } from 'express';
import { prisma } from '../..';


async function getReplyWithChildren(reply: any): Promise<any> {
  const children = await prisma.discussionReply.findMany({
    where: { parentId: reply.id },
    orderBy: { createdAt: 'asc' },
    include: {
      member: { include: { user: true } }
    }
  });

  const nestedChildren = await Promise.all(children.map(getReplyWithChildren));

  return {
    ...reply,
    children: nestedChildren
  };
}

/**
 * @swagger
 * /discussion/reply/{id}:
 *   get:
 *     summary: Get a discussion reply by ID
 *     tags: [Discussion Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved the reply
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscussionReply'
 *       400:
 *         description: Invalid reply ID
 *       404:
 *         description: Reply not found
 *       500:
 *         description: Server error
 */
export const getReplyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid reply ID' });
            return;
        }
        const reply = await prisma.discussionReply.findUnique({ where: { id } });
        if (!reply) {
            res.status(404).json({ error: 'Reply not found' });
            return;
        }
        res.json(reply);
    } catch (error) {
        console.error('Error retrieving reply:', error);
        res.status(500).json({ error: 'Failed to retrieve reply' });
    }
};

/**
 * @swagger
 * /discussion/replies/post/{id}:
 *   get:
 *     summary: Get all replies for a discussion post
 *     tags: [Discussion Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of replies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DiscussionReply'
 *       400:
 *         description: Invalid post ID
 *       500:
 *         description: Server error
 */
export const getRepliesByPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const topLevelReplies = await prisma.discussionReply.findMany({
      where: { postId, parentId: null },
      orderBy: { createdAt: 'desc' },
      include: {
        member: { include: { user: true } }
      }
    });

    const nestedReplies = await Promise.all(
      topLevelReplies.map(getReplyWithChildren)
    );

    res.json(nestedReplies);
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ error: 'Failed to fetch replies' });
  }
};


/**
 * @swagger
 * /discussion/reply:
 *   post:
 *     summary: Create a new discussion reply
 *     tags: [Discussion Board]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required: [postId, memberId, content]
 *             properties:
 *               postId:
 *                 type: integer
 *               memberId:
 *                 type: integer
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reply created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscussionReply'
 *       400:
 *         description: Missing or invalid fields
 *       500:
 *         description: Server error
 */
export const createReply = async (req: Request, res: Response): Promise<void> => {
    const { postId, memberId, content, parentId } = req.body;
    if (!postId || !memberId || !content) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }
    try {
        const reply = await prisma.discussionReply.create({
            data: {
                postId,
                memberId,
                content,
                parentId: parentId ?? null
            }
        });
        res.status(201).json(reply);
        return;
    } catch (error) {
        console.error('Error creating reply:', error);
        res.status(500).json({ error: 'Failed to create reply' });
        return;
    }
};

/**
 * @swagger
 * /discussion/reply/{id}:
 *   put:
 *     summary: Update a discussion reply
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
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reply updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscussionReply'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Reply not found
 *       500:
 *         description: Server error
 */
export const editReply = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id, 10);
    const { content } = req.body;

    if (isNaN(id) || !content) {
        res.status(400).json({ error: 'Invalid ID or missing content' });
        return;
    }

    try {
        const reply = await prisma.discussionReply.update({
            where: { id },
            data: { content },
        });
        res.json(reply);
    } catch (error: any) {
        if (error.code === 'P2025') {
            res.status(404).json({ error: 'Reply not found' });
        } else {
            console.error('Error updating reply:', error);
            res.status(500).json({ error: 'Failed to update reply' });
        }
    }
};

/**
 * @swagger
 * /discussion/reply/{id}:
 *   delete:
 *     summary: Delete a discussion reply
 *     tags: [Discussion Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Successfully deleted
 *       400:
 *         description: Invalid reply ID
 *       404:
 *         description: Reply not found
 *       500:
 *         description: Server error
 */
export const deleteReply = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid reply ID' });
        return;
    };
    try {
        await prisma.discussionReply.delete({ where: { id } });
        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            res.status(404).json({ error: 'Reply not found' });
        } else {
            console.error('Error deleting reply:', error);
            res.status(500).json({ error: 'Failed to delete reply' });
        }
    }
};