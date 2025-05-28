import { Router } from 'express';
import { 
    createAdmissionRequest, 
    approveAdmissionRequest, 
    rejectAdmissionRequest, 
    withdrawAdmissionRequest,
    getLabAdmissionRequests,
    removeLabMember,
    removeLabMemberById,
    getUserLabAdmissionRequests
} from '../controllers/lab/labAdmission.controller';

/**
 * @swagger
 * tags:
 *   name: Lab Admission
 *   description: Lab admission request management API
 */
const router = Router();
router.post('/request', createAdmissionRequest);
router.put('/approve/:admissionId', approveAdmissionRequest);
router.put('/reject/:admissionId', rejectAdmissionRequest);
router.put('/withdraw/:admissionId', withdrawAdmissionRequest);
router.get('/lab/:labId', getLabAdmissionRequests);
router.delete('/removeMember', removeLabMember);
router.delete('/removeMember/:memberId', removeLabMemberById);
router.get('/user/:userId', getUserLabAdmissionRequests);

export default router;