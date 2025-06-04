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