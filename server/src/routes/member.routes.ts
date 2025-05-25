import { Router } from 'express';
import { getMemberById, getMemberByUserId, getStatuses, setStatus, getMemberWithStatus } from '../controllers/member/member.controller';

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
router.post('/set-status', setStatus);
router.get('/get-with-status/:id', getMemberWithStatus);

export default router;