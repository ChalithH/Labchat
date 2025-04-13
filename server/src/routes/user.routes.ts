import { Router } from 'express';
import { getUsers } from '../controllers/user/user.controller';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */
const router = Router();

router.get('/', getUsers);


export default router;