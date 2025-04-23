import { Request, Response } from 'express';
import { prisma } from '../..';


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
 *      Get Posts By Filter
 */ 

export const getPostById = async (req: Request, res: Response): Promise<void> => {
    
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
