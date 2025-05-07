import { Request, Response } from 'express';
import { prisma } from '../..';
import { DiscussionPost } from '@prisma/client';

/*
 *      Get Recent Posts
 *
 *    Body Parameters:
 *      amount?: number
 * 
 *    200:
 *      - Successfully returned most recent posts
 *    500:
 *      - Internal server error
 */
export const getRecentPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const amount = parseInt(req.body.amount as string) || 9
    console.log(amount)
    const posts: DiscussionPost[] = await prisma.discussionPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: amount,
    })
    res.status(200).json(posts)

  } catch (err) {
    res.status(500).json({ error: 'Failed to obtain list of recent posts' })
  }
}

export const getPopularPosts = async (req: Request, res: Response): Promise<void> => {
    
}

export const getMixedPosts = async (req: Request, res: Response): Promise<void> => {
    
}
