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
    const amount = parseInt(req.params.amount, 10) || 9
    const posts: DiscussionPost[] = await prisma.discussionPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: amount,
      include: {
        member: { include: { user: true } }
      }
    })

    res.status(200).json(posts)

  } catch (err) {
    res.status(500).json({ error: 'Failed to obtain list of recent posts' })
  }
}

/*
 *      Get Popular Posts
 *
 *    Body Parameters:
 *      amount?: number
 * 
 *    200:
 *      - Successfully returned most popular posts
 *    500:
 *      - Internal server error
 */
export const getPopularPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const amount = parseInt(req.params.amount, 10) || 9
    const posts: DiscussionPost[] = await prisma.discussionPost.findMany({
      take: amount,
      orderBy: {
        replies: { _count: 'desc' }},
        
      include: {
        _count: { select: { replies: true } }}
    })

    res.status(200).json(posts)

  } catch (err) {
    res.status(500).json({ error: 'Failed to obtain list of popular posts' })
  }
}

/*
 *      Get Mixed Posts
 *
 *    Body Parameter:
 *      amount?: number
 * 
 *    200:
 *      - Successfully returned mixed posts
 *    500:
 *      - Internal server error
 */
export const getMixedPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const amount = parseInt(req.params.amount, 10) || 9
    const recent: DiscussionPost[] = await prisma.discussionPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: amount,
    })

    const popular: DiscussionPost[] = await prisma.discussionPost.findMany({
      take: amount,
      orderBy: {
        replies: { _count: 'desc' }},
        
      include: {
        _count: { select: { replies: true } }}
    })

    const merged: DiscussionPost[] = [...recent, ...popular.filter(p => !recent.some(r => r.id === p.id))].slice(0, amount)
    res.status(200).json(merged)

  } catch (err) {
    res.status(500).json({ error: 'Failed to obtain list of mixed posts' })
  }
}
