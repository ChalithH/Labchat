import { Router } from 'express';
import { getUsers, getUserById } from '../controllers/user/user.controller';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */
const router = Router();

router.get('/', getUsers);
router.get('/:id', getUserById);

export default router;