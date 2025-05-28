import { Router } from 'express';
import { getMemberById, getMemberByUserId, getStatuses } from '../controllers/member/member.controller';

/**
 * @swagger
 * tags:
 *   name: Lab members
 *   description: Lab member management API
 */
const router = Router();


router.get('/get/:id', getMemberById);
router.get('/get/user/:id', getMemberByUserId);
router.get('/statuses', getStatuses);

export default router;