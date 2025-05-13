import { Router } from 'express';
import { getMemberById, getMemberByUserId } from '../controllers/member/member.controller';

/**
 * @swagger
 * tags:
 *   name: Lab members
 *   description: Lab member management API
 */
const router = Router();


router.get('/get/:id', getMemberById);
router.get('/get/user/:id', getMemberByUserId);

export default router;