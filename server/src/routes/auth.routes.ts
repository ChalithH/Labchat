import { Router } from 'express';
import { getAuth, isAuth, clearAuth } from '../controllers/auth/auth.controller';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */
const router = Router();

router.post('/', getAuth);
router.get('/status', isAuth);
router.get('/logout', clearAuth);

export default router;