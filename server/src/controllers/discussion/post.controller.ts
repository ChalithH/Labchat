import { Request, Response } from 'express';
import { prisma } from '../..';
import { DiscussionPost, DiscussionPostReplyState, LabMember } from '@prisma/client';


/*
 *      Create Post
 *
 *    Parameters:
 *      discussionId: number
 *      memberId: number
 *      title: string
 *      content: string
 *      createdAt?: string
 *      updatedAt?: string
 *      isPinned?: boolean
 *      isAnnounce?: boolean
 * 
 *    200:
 *      - Successfully created the post
 *    400:
 *      - Missing fields to create post in request body
 *    500:
 *      - Internal server error, unable to create post     
 */ 
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { discussionId, memberId, title, content, createdAt, updatedAt, isPinned, isAnnounce } = req.body
    const now = new Date()

    delete req.body.id

    if (!discussionId || !memberId || !title || !content) {
      res.status(400).send({ error: 'Missing fields in request body' })
      return
    }
    
    const member = await prisma.labMember.findFirst({
      where: {
        userId: memberId
      }
    })

    if (!member) {
      res.status(400).json({ error: 'No lab member found' });
      return;
    }

    const post = await prisma.discussionPost.create({
      data: {
        discussionId,
        memberId: member.id,
        title,
        content,
        createdAt: createdAt ? new Date(createdAt) : now,
        updatedAt: updatedAt ? new Date(updatedAt) : now,
        isPinned: isPinned ?? false,
        isAnnounce: isAnnounce ?? false
      }
    })

    res.status(200).json(post)
    return

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to create post' })
    return
  }
}

/*
 *      Edit Post
 *
 *    Parameters:
 *      id: number
 *      title?: string
 *      content?: string
 *      updatedAt?: string
 *      isPinned?: boolean
 *      isAnnounce?: boolean
 * 
 *    200:
 *      - Successfully updated the post
 *    400:
 *      - Failed to parse an ID from request
 *      - No post found with ID specified
 *      - Missing request body parameters
 *    500:
 *      - Internal server error, unable to update post     
 */ 
export const editPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const id: number = parseInt(req.params.id)
    if (!id) {
      res.status(400).json({ error: 'Failed to parse an ID from request' })
      return
    }

    const found_post: DiscussionPost | null = await prisma.discussionPost.findUnique({ where: { id } })
    if (!found_post) {
      res.status(400).json({ error: `No post found with ID ${id}` })
      return
    }

    if (!req.body) {
      res.status(400).json({ error: 'Missing request body parameters' })
      return
    }

    const { title, content, updatedAt, isPinned, isAnnounce, replyState, state } = req.body

    const updatedPost = await prisma.discussionPost.update({
      where: { id },
      data: {
        title: title ?? found_post.title,
        content: content ?? found_post.content,
        updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
        isPinned: isPinned ?? found_post.isPinned,
        isAnnounce: isAnnounce ?? found_post.isAnnounce,
        state: state ?? 'DEFAULT',
        replyState: replyState ?? 'REPLIES_OPEN'
      }
    })

    res.status(200).json(updatedPost)
    return

  } catch (err: unknown) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update post' })
    return
  }
}

/*
 *      Delete Post
 *
 *    Parameters:
 *      id: number
 * 
 *    200:
 *      - Successfully deleted the post
 *    400:
 *      - Failed to parse an ID from request body parameters
 *      - No post found with the ID supplied
 *    500:
 *      - Internal server error, unable to delete post     
 */ 
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const id: number = parseInt(req.params.id)
    if (!id) {
      res.status(400).send({ error: 'Failed to parse an ID from request' })
      return
    }

    const post = await prisma.discussionPost.findUnique({ where: { id }})
    if (!post) {
      res.status(400).send({ error: `No post found with ID ${id}` })
      return
    }

    await prisma.discussionPost.delete({
      where: { id }
    })

    res.status(200).json({ msg: 'Successfully deleted post'})
    return

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to delete post' })
    return
  }
}

/*
 *      Get Post By Id
 *
 *    Parameters:
 *      id: number
 * 
 *    200:
 *      - Successfully found the post
 *    400:
 *      - Failed to parse an ID from request body parameters
 *      - No post found with the ID supplied
 *    500:
 *      - Internal server error, unable to retrieve the post     
 */ 
export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id: number = parseInt(req.params.id)
    if (!id) {
      res.status(400).json({ error: 'Failed to parse an ID from request' })
      return
    }

    const post: DiscussionPost | null = await prisma.discussionPost.findUnique({ 
      where: { id },
      include: {
        member: { include: { user: true } }
      }
    })
    if (!post) {
      res.status(400).json({ error: `No post found with an ID of ${ id }` })
      return
    }


    
    res.status(200).send(post)
    return

  } catch(err: unknown) {
    res.status(500).json({ error: 'Failed to retrieve post' })
    return
  } 
}

/*
 *      Get Posts By Member
 *
 *    Parameters:
 *      member_id: number
 * 
 *    200:
 *      - Successfully found the post
 *    400:
 *      - Failed to parse a lab member ID from request body parameters
 *      - No lab member found with the ID supplied
 *    500:
 *      - Internal server error, unable to retrieve the post     
 */ 
export const getPostsByMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const member_id: number = parseInt(req.params.id)
    if (!member_id) {
      res.status(400).json({ error: 'Failed to parse a member ID from request' })
      return
    }

    const member: LabMember | null = await prisma.labMember.findUnique({ where: { id: member_id }})
    if (!member) {
      res.status(400).json({ error: `No member found with an ID of ${ member_id }` })
      return
    }

    const posts: DiscussionPost[] | null = await prisma.discussionPost.findMany({ 
      where: { memberId: member.id } 
    })
    res.status(200).send(posts)
    return

  } catch(err: unknown) {
    res.status(500).json({ error: 'Failed to retrieve post' })
    return
  }  
}

/*
 *      Get Posts By Title
 *
 *    Parameter:
 *      title: string
 * 
 *    200:
 *      - Successfully found and sent the posts
 *    400:
 *      - Failed to obtain the post title from request body parameters
 *      - No posts found with the title supplied
 *    500:
 *      - Internal server error, unable to retrieve the posts     
 */
export const getPostsByTitle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title } = req.body
    if (!title) {
      res.status(400).json({ error: 'Failed to obtain a title from request' })
      return
    }

    // Case insensitive partial search for the term supplied
    const posts: DiscussionPost[] = await prisma.discussionPost.findMany({ 
      where: { 
        title: {
          contains: title,
          mode: 'insensitive'
        }
      }
    })
    res.status(200).send(posts)
    return

  } catch(err: unknown) {
    res.status(500).json({ error: 'Failed to retrieve post' })
    return
  }   
}

/*
 *      Get Posts By Category
 *
 *    Parameters:
 *      category_id: number
 * 
 *    200:
 *      - Successfully found the category and sent posts
 *    400:
 *      - Failed to parse a category ID from request body parameters
 *      - No category found with the ID supplied
 *    500:
 *      - Internal server error, unable to retrieve the posts     
 */ 
export const getPostsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category_id: number = parseInt(req.params.id)
    if (!category_id) {
      res.status(400).json({ error: 'Failed to parse a category ID from supplied paramter'})
      return
    }

    const posts: DiscussionPost[] | null = await prisma.discussionPost.findMany({ 
      where: { discussionId: category_id },
      include: {
        member: { include: { user: true } }
      }
    })

    const sortedPosts = posts.sort((a, b) => {
      const isASticky = a.state === 'STICKY'
      const isBSticky = b.state === 'STICKY'

      if (isASticky && !isBSticky) return -1
      if (!isASticky && isBSticky) return 1

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    res.status(200).send(sortedPosts)
    return

  } catch(err: unknown) {
    res.status(500).json({ error: 'Failed to retrieve posts' })
    return
  }  
}