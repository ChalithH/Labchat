import { Router } from 'express';
import { getMemberById } from '../controllers/member/member.controller';

/**
 * @swagger
 * tags:
 *   name: Lab members
 *   description: Lab member management API
 */
const router = Router();


router.get('/get/:id', getMemberById);

export default router;