import { Router } from 'express'
import { createPost, deletePost, editPost, getPostById, getPostsByCategory, getPostsByMember, getPostsByTitle } from '../controllers/discussion/post.controller'
import {
    getAllTags,
    getTagById,
    createTag,
    editTag,
    deleteTag,
    assignTagToPost, 
    removeTagFromPost
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
router.get('/tags', getAllTags); 
router.get('/tags/:id', getTagById); 
router.post('/tags', createTag); 
router.put('/tags/:id', editTag); 
router.delete('/tags/:id', deleteTag); 
router.post('/posts/:postId/tags', assignTagToPost);
router.delete('/posts/:postId/tags/:tagAssignmentId', removeTagFromPost);

// reply controller routes
router.get('/reply/:id', getReplyById)
router.get('/replies/post/:id', getRepliesByPost);
router.post('/reply', createReply)
router.put('/reply/:id', editReply)
router.delete('/reply/:id', deleteReply)


// misc controller routes
router.get('/recent', getRecentPosts)
router.get('/popular', getPopularPosts)
router.get('/mixed', getMixedPosts)


export default router