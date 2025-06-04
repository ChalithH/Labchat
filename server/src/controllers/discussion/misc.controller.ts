import { Request, Response } from 'express';
import { prisma } from '../..';
import { DiscussionPost } from '@prisma/client';

/*
 *      Get Recent Posts
 *
 *    Body Parameters:
 *      amount?: number
 *      labId?: number (optional - filters posts by lab)
 * 
 *    200:
 *      - Successfully returned most recent posts
 *    500:
 *      - Internal server error
 */
export const getRecentPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const amount = parseInt(req.params.amount, 10) || 9

    const posts = await prisma.discussionPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: amount,
      include: {
        member: { include: { user: true } },
        tags: { include: { postTag: true } },
        reactions: { include: { reaction: true } }
      }
    })

    const postsWithTags = posts.map(post => ({
      ...post,
      tags: post.tags.map(tag => tag.postTag)
    }))

    res.status(200).json(postsWithTags)
  } catch (err) {
    res.status(500).json({ error: 'Failed to obtain list of recent posts' })
  }
}

/*
 *      Get Popular Posts
 *
 *    Body Parameters:
 *      amount?: number
 *      labId?: number (optional - filters posts by lab)
 * 
 *    200:
 *      - Successfully returned most popular posts
 *    500:
 *      - Internal server error
 */
export const getPopularPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const amount = parseInt(req.params.amount, 10) || 9
    const labId = req.query.labId ? parseInt(req.query.labId as string, 10) : undefined

    const whereClause = labId 
      ? {
          discussion: {
            labId: labId
          }
        }
      : {}

    const posts: DiscussionPost[] = await prisma.discussionPost.findMany({
      where: whereClause,
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
 *      labId?: number (optional - filters posts by lab)
 * 
 *    200:
 *      - Successfully returned mixed posts
 *    500:
 *      - Internal server error
 */
export const getMixedPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const amount = parseInt(req.params.amount, 10) || 9
    const labId = req.query.labId ? parseInt(req.query.labId as string, 10) : undefined

    const whereClause = labId 
      ? {
          discussion: {
            labId: labId
          }
        }
      : {}

    const recent: DiscussionPost[] = await prisma.discussionPost.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: amount,
    })

    const popular: DiscussionPost[] = await prisma.discussionPost.findMany({
      where: whereClause,
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

/*
 *      Get Discussions for Lab
 *
 *    Parameters:
 *      labId?: number (optional query parameter)
 * 
 *    200:
 *      - Successfully returned discussions for the lab
 *    500:
 *      - Internal server error
 */
export const getDiscussionsForLab = async (req: Request, res: Response): Promise<void> => {
  try {
    const labId = req.query.labId ? parseInt(req.query.labId as string, 10) : undefined

    const whereClause = labId ? { labId: labId } : {}

    const discussions = await prisma.discussion.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    res.status(200).json(discussions)

  } catch (err) {
    res.status(500).json({ error: 'Failed to obtain list of discussions' })
  }
}
