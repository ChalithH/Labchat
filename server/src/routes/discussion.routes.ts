import { Router } from 'express';

import { getPostById, getPostsByMember } from '../controllers/discussion/discussion.controller';


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

export default router;