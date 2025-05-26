import { Router } from 'express'
import { createPost, deletePost, editPost, getPostById, getPostsByCategory, getPostsByMember, getPostsByTitle } from '../controllers/discussion/post.controller'
import {
    getAllCategoriesByLab,
    getAllCategories,
    getCategoryById,
    deleteCategory
} from '../controllers/discussion/category.controller'; 
import { getReplyById, getRepliesByPost, createReply, editReply, deleteReply,} from '../controllers/discussion/reply.controller'
import { getMixedPosts, getPopularPosts, getRecentPosts } from '../controllers/discussion/misc.controller'
import { assignTagToPost, createTag, deleteTag, editTag, getAllTags, getTagById, getTagsForPost, removeTagFromPost } from '../controllers/discussion/tag.controller';
import { getAllPostReactions, getAllReplyReactions, getReactionsForPost, getReactionsForReply, toggleReaction } from '../controllers/discussion/reaction.controller';

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

// tag controller routes
router.get('/tags', getAllTags); 
router.get('/tags/:id', getTagById);
router.get('/tags/post/:id', getTagsForPost);
router.post('/tags', createTag); 
router.put('/tags/:id', editTag); 
router.delete('/tags/:id', deleteTag); 
router.post('/posts/:postId/tags', assignTagToPost);
router.delete('/posts/:postId/tags/:tagAssignmentId', removeTagFromPost);

// reaction controller routes (post)
router.get('/reactions/post', getAllPostReactions);
router.get('/reactions/post/:id', getReactionsForPost);

// reaction controller routes (reply)
router.get('/reactions/reply', getAllReplyReactions);
router.get('/reactions/reply/:id', getReactionsForReply);

router.post('/reactions/toggle', toggleReaction);

// misc controller routes
router.get('/recent/:id', getRecentPosts)
router.get('/popular/:id', getPopularPosts)
router.get('/mixed/:id', getMixedPosts)


export default router