import { NextFunction, Router } from 'express';

import { login, logout, locked, status } from '../controllers/auth/auth.controller';
import { requirePermission } from '../middleware/permission.middleware';


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and authorisation management API
 */
const router = Router();


// /api/auth/
router.get('/locked', requirePermission(20), locked);

router.get('/status', status);
router.get('/logout', logout);

router.post('/login', login);


export default router;