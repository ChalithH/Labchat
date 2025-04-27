import { Request, Response } from 'express';
import { prisma } from '../..';
import { DiscussionPost, LabMember, User } from '@prisma/client';


/*
 *      Category endpoints
 */ 

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {

}

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  
}

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  
}

export const editCategory = async (req: Request, res: Response): Promise<void> => {
  
}

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  
}


/*
 *      Posts endpoints
 */ 

export const createPost = async (req: Request, res: Response): Promise<void> => {
    
}

export const editPost = async (req: Request, res: Response): Promise<void> => {
    
}

export const deletePost = async (req: Request, res: Response): Promise<void> => {
    
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
      where: { id } 
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
 *      user_id: number
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

export const getPostsByTitle = async (req: Request, res: Response): Promise<void> => {
    
}

export const getPostsByCategory = async (req: Request, res: Response): Promise<void> => {
    
}



/*
 *      Reply Endpoints
 */

export const getReplyById = async (req: Request, res: Response): Promise<void> => {
  
}

export const getRepliesByPost = async (req: Request, res: Response): Promise<void> => {
  
}

export const createReply = async (req: Request, res: Response): Promise<void> => {
    
}

export const editReply = async (req: Request, res: Response): Promise<void> => {
    
}

export const deleteReply = async (req: Request, res: Response): Promise<void> => {
    
}



/*
 *      Unique Cases
 */ 

export const getRecentPosts = async (req: Request, res: Response): Promise<void> => {
    
}

export const getPopularPosts = async (req: Request, res: Response): Promise<void> => {
    
}

export const getMixedPosts = async (req: Request, res: Response): Promise<void> => {
    
}
