import { Router } from 'express';
import { getAuth, isAuth } from '../controllers/auth/auth.controller';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */
const router = Router();

router.post('/', getAuth);
router.get('/test', isAuth);

export default router;