import { Router } from 'express';
import { getLab, getLabMembers, getLabMembersList } from '../controllers/lab/lab.controller';



/**
 * @swagger
 * tags:
 *   name: Lab
 *   description: Lab management API
 */
const router = Router();


// Contacts
router.get('/:labId', getLab); 
router.get('/getMembers/:labId', getLabMembers);
router.get('/getMembersList/:labId', getLabMembersList); // For testing purposes

export default router;