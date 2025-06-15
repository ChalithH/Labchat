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
    const {
      discussionId,
      memberId,
      title,
      content,
      createdAt,
      updatedAt,
      isPinned,
      isAnnounce,
      selectedTagIds = []
    } = req.body

    const now = new Date()

    delete req.body.id

    if (!discussionId || !memberId || !title || !content) {
      res.status(400).send({ error: 'Missing fields in request body' })
      return
    }

    const member = await prisma.labMember.findFirst({
      where: {
        userId: memberId,
      }
    })

    if (!member) {
      res.status(400).json({ error: 'No lab member found' })
      return
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

    if (Array.isArray(selectedTagIds) && selectedTagIds.length > 0) {
      const tagAssignments = selectedTagIds.map((tagId: number) =>
        prisma.discussionPostTag.create({
          data: {
            postId: post.id,
            postTagId: tagId
          }
        })
      )
      await Promise.all(tagAssignments)
    }

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
    const id: number = parseInt(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Failed to parse an ID from request' });
      return;
    }

    const found_post = await prisma.discussionPost.findUnique({ where: { id } });
    if (!found_post) {
      res.status(400).json({ error: `No post found with ID ${id}` });
      return;
    }

    if (!req.body) {
      res.status(400).json({ error: 'Missing request body parameters' });
      return;
    }

    const {
      title,
      content,
      updatedAt,
      isPinned,
      isAnnounce,
      replyState,
      state,
      selectedTagIds = []
    } = req.body

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

    if (Array.isArray(selectedTagIds)) {
      await prisma.discussionPostTag.deleteMany({ where: { postId: id } })
      if (selectedTagIds.length > 0) {
        const tagAssignments = selectedTagIds.map((tagId: number) =>
          prisma.discussionPostTag.create({
            data: {
              postId: id,
              postTagId: tagId
            }
          })
        )
        await Promise.all(tagAssignments)
      }
    }

    res.status(200).json(updatedPost)
  } catch (err: unknown) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update post' })
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

    const post = await prisma.discussionPost.findUnique({ 
      where: { id },
      include: {
        member: { include: { user: true } },
        tags: { include: { postTag: true } },
        reactions: { include: { reaction: true }}
      }
    })
    
    if (!post) {
      res.status(400).json({ error: `No post found with an ID of ${id}` })
      return
    }

    const postWithTags = {
      ...post,
      tags: post.tags.map(tag => tag.postTag)
    }

    res.status(200).send(postWithTags)
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
    const { title } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Failed to obtain a title from request' });
      return;
    }

    // Case insensitive partial search for the term supplied
    const posts = await prisma.discussionPost.findMany({ 
      where: { 
        title: {
          contains: title,
          mode: 'insensitive'
        }
      },
      include: {
        tags: { include: { postTag: true } },
        member: { include: { user: true } },
        reactions: { include: { reaction: true } }
      }
    });

    const postsWithTags = posts.map(post => ({
      ...post,
      tags: post.tags.map(tag => tag.postTag)
    }));

    res.status(200).send(postsWithTags);
    return;

  } catch (err: unknown) {
    res.status(500).json({ error: 'Failed to retrieve post' });
    return;
  }   
};

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
    const lab_id: number = parseInt(req.params.lab)
    if (!category_id || !lab_id) {
      res.status(400).json({ error: 'Failed to parse a category ID or lab ID from supplied paramter'})
      return
    }

    const posts = await prisma.discussionPost.findMany({
      where: { discussionId: category_id, discussion: { labId: lab_id } },
      include: {
        member: { include: { user: true } },
        tags: { include: { postTag: true } },
        reactions: { include: { reaction: true } }
      }
    })

    const sortedPosts = posts.sort((a, b) => {
      const isASticky = a.state === 'STICKY'
      const isBSticky = b.state === 'STICKY'

      if (isASticky && !isBSticky) return -1
      if (!isASticky && isBSticky) return 1

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    const postsWithTags = sortedPosts.map(post => ({
      ...post,
      tags: post.tags.map(tag => tag.postTag)
    }))

    res.status(200).send(postsWithTags)
    return

  } catch(err: unknown) {
    res.status(500).json({ error: 'Failed to retrieve posts' })
    return
  }  
}

/*
 *      Get Announcements By Lab
 *
 *    Parameters:
 *      labId: number
 * 
 *    200:
 *      - Successfully found announcements for the lab
 *    400:
 *      - Failed to parse a lab ID from request parameters
 *      - No lab found with the ID supplied
 *    500:
 *      - Internal server error, unable to retrieve announcements     
 */ 
export const getAnnouncementsByLab = async (req: Request, res: Response): Promise<void> => {
  try {
    const labId: number = parseInt(req.params.labId);
    if (!labId) {
      res.status(400).json({ error: 'Failed to parse a lab ID from request parameters' });
      return;
    }

    const lab = await prisma.lab.findUnique({ where: { id: labId } });
    if (!lab) {
      res.status(400).json({ error: `No lab found with an ID of ${labId}` });
      return;
    }

    const announcements: DiscussionPost[] = await prisma.discussionPost.findMany({
      where: {
        discussion: {
          labId: labId,
          name: "Announcements",
        },
      },
      include: {
        discussion: true, // Include discussion to confirm labId relation
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5, // Limit to 5 most recent announcements for dashboard
    });

    res.status(200).json(announcements);
    return;

  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve announcements for the lab' });
    return;
  }
};