import { Router } from 'express';
import { getAllLabs, getLab, getLabMembers, getLabMembersList, getLabRoles, getUserLabs } from '../controllers/lab/lab.controller';



/**
 * @swagger
 * tags:
 *   name: Lab
 *   description: Lab management API
 */
const router = Router();
router.get('/all', getAllLabs);
router.get('/roles', getLabRoles);
// Contacts
router.get('/:labId', getLab); 
router.get('/getMembers/:labId', getLabMembers);
router.get('/getMembersList/:labId', getLabMembersList); // For testing purposes

router.get('/user/:userId/labs', getUserLabs)

export default router;