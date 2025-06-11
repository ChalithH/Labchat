import { Router } from 'express';
import { getMemberById, getMemberByUserId, getMembershipsByUserId, getStatuses, setStatus, getMemberWithStatus, getMemberByUserIdAndLabId, createMemberStatus, updateMemberStatus, deleteMemberStatus } from '../controllers/member/member.controller';

/**
 * @swagger
 * tags:
 *   name: Lab members
 *   description: Lab member management API
 */
const router = Router();


router.get('/get/:id', getMemberById);
router.get('/get/user/:id', getMemberByUserId);
router.get('/get/user-lab/:userId/:labId', getMemberByUserIdAndLabId);
router.get('/memberships/user/:id', getMembershipsByUserId);
router.get('/statuses', getStatuses);
router.post('/set-status', setStatus);
router.get('/get-with-status/:id', getMemberWithStatus);

router.post('/member-status', createMemberStatus);
router.put('/member-status/:id', updateMemberStatus);
router.delete('/member-status/:id', deleteMemberStatus);

export default router;