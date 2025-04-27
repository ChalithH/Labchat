import { Router } from 'express';

import { getPostById, getPostsByCategory, getPostsByMember, getPostsByTitle } from '../controllers/discussion/discussion.controller';


/**
 * @swagger
 * tags:
 *   name: Discussion Board
 *   description: Discussion Board management API
 */
const router = Router();


// /api/discussion/
router.get('/post/:id', getPostById);
router.get('/member-posts/:id', getPostsByMember);
router.get('/category-posts/:id', getPostsByCategory)
router.post('/title-posts', getPostsByTitle)


export default router;