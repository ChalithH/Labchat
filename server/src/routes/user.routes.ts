import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, getUserContacts } from '../controllers/user/user.controller';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */
const router = Router();


router.post('/', createUser);
router.put('/update/:id', updateUser);
router.get('/get', getUsers);
router.get('/get/:id', getUserById);
router.get('/:userId/contacts', getUserContacts);

export default router;