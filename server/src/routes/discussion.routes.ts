import { Router } from 'express';

import { getPostById, getPostsByCategory, getPostsByMember } from '../controllers/discussion/discussion.controller';


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

export default router;