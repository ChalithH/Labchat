import { Router } from 'express';

import { getPostById } from '../controllers/discussion/discussion.controller';


/**
 * @swagger
 * tags:
 *   name: Discussion Board
 *   description: Discussion Board management API
 */
const router = Router();


// /api/discussion/
router.get('/post/:id', getPostById);

export default router;