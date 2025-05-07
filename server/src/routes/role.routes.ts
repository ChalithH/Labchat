import { Router } from 'express';
import { getRoleById, getRoles } from '../controllers/role/role.controller';

/**
 * @swagger
 * tags:
 *   name: Role
 *   description: Role management API
 */
const router = Router();


router.get('/get', getRoles);
router.get('/get/:id', getRoleById);

export default router;