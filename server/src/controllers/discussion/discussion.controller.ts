import { Request, Response } from 'express';
import { prisma } from '../..';
import { DiscussionPost } from '@prisma/client';


/*
 *      Get Categories
 */ 

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {

}



/*
 *      Create, Edit and Delete Posts
 */ 

export const createPost = async (req: Request, res: Response): Promise<void> => {
    
}

export const editPost = async (req: Request, res: Response): Promise<void> => {
    
}

export const deletePost = async (req: Request, res: Response): Promise<void> => {
    
}



/*
 *      Get Posts By Id
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
    }

    const post: DiscussionPost | null = await prisma.discussionPost.findUnique({ where: { id } })
    if (!post) {
      res.status(400).json({ error: `No post found with an ID of ${ id }` })
    }
    
    res.status(200).send(post)
  } catch(err: unknown) {
    res.status(500).json({ error: 'Failed to retrieve post' })
  } 
}


export const getPostByUser = async (req: Request, res: Response): Promise<void> => {
    
}

export const getPostByTitle = async (req: Request, res: Response): Promise<void> => {
    
}

export const getPostByCategory = async (req: Request, res: Response): Promise<void> => {
    
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
