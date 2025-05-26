import { Request, Response } from 'express'
import { io, prisma } from '../..'
import { notifyUser } from '../../socket'

export const toggleReaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { targetId, targetType, memberId, reactionId } = req.body;

    if (!targetId || !targetType || !memberId || !reactionId) {
      res.status(400).json({ error: 'targetId, targetType, memberId, and reactionId are required' });
      return;
    }

    let existingReaction;
    let newReaction;
    let notifyPayload;
    
    if (targetType === 'post') {
      const postId = targetId;

      existingReaction = await prisma.discussionPostReaction.findFirst({
        where: { postId, memberId }
      });

      if (existingReaction) {
        await prisma.discussionPostReaction.delete({
          where: { id: existingReaction.id }
        });

        notifyPayload = {
          type: 'reaction_removed',
          postId,
          memberId,
          reactionId
        };

        notifyUser(io, memberId, notifyPayload);

        if (existingReaction.reactionId === reactionId) {
          res.status(200).json({ message: 'Reaction removed' });
          return;
        }
      }

      newReaction = await prisma.discussionPostReaction.create({
        data: { postId, memberId, reactionId }
      });

      notifyPayload = {
        type: 'reaction_added',
        postId,
        memberId,
        reactionId
      };

      notifyUser(io, memberId, notifyPayload);
      res.status(201).json(newReaction);
      return;

    } else if (targetType === 'reply') {
      const replyId = targetId;

      existingReaction = await prisma.discussionReplyReaction.findFirst({
        where: { replyId, memberId }
      });

      if (existingReaction) {
        await prisma.discussionReplyReaction.delete({
          where: { id: existingReaction.id }
        });

        notifyPayload = {
          type: 'reply_reaction_removed',
          replyId,
          memberId,
          reactionId
        };

        notifyUser(io, memberId, notifyPayload);

        if (existingReaction.reactionId === reactionId) {
          res.status(200).json({ message: 'Reaction removed' });
          return;
        }
      }

      newReaction = await prisma.discussionReplyReaction.create({
        data: { replyId, memberId, reactionId }
      });

      notifyPayload = {
        type: 'reply_reaction_added',
        replyId,
        memberId,
        reactionId
      };

      notifyUser(io, memberId, notifyPayload);
      res.status(201).json(newReaction);
      return;

    } else {
      res.status(400).json({ error: 'Invalid targetType, must be "post" or "reply"' });
      return;
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle reaction' });
  }
};


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
  const postId = parseInt(req.params.id, 10)

  if (isNaN(postId)) {
    res.status(400).json({ error: `Invalid postId ${ postId }` })
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

export const getAllReplyReactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const reactions = await prisma.replyReaction.findMany()
    res.status(200).json(reactions)
    return

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get all reply reactions' })
    return
  }
}

export const getReactionsForReply = async (req: Request, res: Response): Promise<void> => {
  const replyId = parseInt(req.params.id, 10)

  if (isNaN(replyId)) {
    res.status(400).json({ error: `Invalid replyId ${replyId}` })
    return
  }

  try {
    const reactions = await prisma.discussionReplyReaction.findMany({
      where: { replyId },
      include: { member: { include: { user: true } }, reaction: true }
    })

    res.status(200).json(reactions)
    return

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get reactions for reply' })
    return
  }
}
