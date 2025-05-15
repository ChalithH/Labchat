import { Router } from 'express'
import { createPost, deletePost, editPost, getPostById, getPostsByCategory, getPostsByMember, getPostsByTitle } from '../controllers/discussion/post.controller'
import {
    createTag,
    editTag,
    assignTagToPost, 
    removeTagFromPost,
    getAllCategoriesByLab,
    getAllCategories,
    getCategoryById,
    deleteCategory
} from '../controllers/discussion/category.controller'; 
import { getReplyById, getRepliesByPost, createReply, editReply, deleteReply,} from '../controllers/discussion/reply.controller'
import { getMixedPosts, getPopularPosts, getRecentPosts } from '../controllers/discussion/misc.controller'
/**
 * @swagger
 * tags:
 *   name: Discussion Board
 *   description: Discussion Board management API
 */
const router = Router()


// /api/discussion/

// post controller routes
router.delete('/post/:id', deletePost)
router.get('/post/:id', getPostById)
router.post('/post', createPost)
router.put('/post/:id', editPost)

router.get('/category-posts/:id', getPostsByCategory)
router.get('/member-posts/:id', getPostsByMember)
router.post('/title-posts', getPostsByTitle)


// category controller routes
router.get('/categories', getAllCategories); 
router.get('/categories/lab/:id', getAllCategoriesByLab); 
router.get('/categories/:id', getCategoryById);
 
router.post('/categories', createTag); 
router.put('/categories/:id', editTag); 
router.delete('/categories/:id', deleteCategory); 
router.post('/posts/:postId/categories', assignTagToPost);
router.delete('/posts/:postId/categories/:tagAssignmentId', removeTagFromPost);

// reply controller routes
router.get('/reply/:id', getReplyById)
router.get('/replies/post/:id', getRepliesByPost);
router.post('/reply', createReply)
router.put('/reply/:id', editReply)
router.delete('/reply/:id', deleteReply)


// misc controller routes
router.get('/recent/:id', getRecentPosts)
router.get('/popular/:id', getPopularPosts)
router.get('/mixed/:id', getMixedPosts)


export default router