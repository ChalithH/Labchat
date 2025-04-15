import { Router } from 'express';
import { getAuth, isAuth, clearAuth, protectedPoint } from '../controllers/auth/auth.controller';
import { requirePermission } from '../middleware/permission.middleware';

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
router.get('/protected', requirePermission(80), protectedPoint);

export default router;