import { Request, Response } from 'express'
import { prisma } from '../..'

export const togglePostReaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId, memberId, reactionId } = req.body

    if (!postId || !memberId || !reactionId) {
      res.status(400).json({ error: 'postId, memberId, and reactionId are required' })
      return
    }

    const existingReaction = await prisma.discussionPostReaction.findFirst({
      where: { postId, memberId, reactionId }
    })

    if (existingReaction) {
      await prisma.discussionPostReaction.delete({
        where: { id: existingReaction.id }
      })
      res.status(200).json({ message: 'Reaction removed' })
      return

    } else {
      const newReaction = await prisma.discussionPostReaction.create({
        data: { postId, memberId, reactionId }
      })
      res.status(201).json(newReaction)
      return
    }

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to toggle reaction' })
    return
  }
}

export const getAllPostReactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const reactions = await prisma.postReaction.findMany()
    res.status(200).json(reactions)
    return

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get all reactions' })
    return
  }
}

export const getReactionsForPost = async (req: Request, res: Response): Promise<void> => {
  const postId = parseInt(req.params.postId, 10)

  if (isNaN(postId)) {
    res.status(400).json({ error: 'Invalid postId' })
    return
  }

  try {
    const reactions = await prisma.discussionPostReaction.findMany({
      where: { postId },
      include: {
        member: { include: { user: true } },
        reaction: true
      }
    })

    res.status(200).json(reactions)
    return

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get reactions for post' })
    return
  }
}
