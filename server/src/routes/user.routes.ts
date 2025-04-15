import { Router } from 'express';
import { getUsers, getUserById, createUser } from '../controllers/user/user.controller';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */
const router = Router();


router.post('/', createUser);
router.get('/get', getUsers);
router.get('/get/:id', getUserById);

export default router;