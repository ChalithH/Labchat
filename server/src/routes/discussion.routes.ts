import { Router } from 'express'
import { createPost, deletePost, editPost, getPostById, getPostsByCategory, getPostsByMember, getPostsByTitle } from '../controllers/discussion/post.controller'

/**
 * @swagger
 * tags:
 *   name: Discussion Board
 *   description: Discussion Board management API
 */
const router = Router()


// /api/discussion/
router.delete('/post/:id', deletePost)
router.get('/post/:id', getPostById)
router.post('/post', createPost)
router.put('/post/:id', editPost)

router.get('/category-posts/:id', getPostsByCategory)
router.get('/member-posts/:id', getPostsByMember)
router.post('/title-posts', getPostsByTitle)


export default router