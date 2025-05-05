import { Router } from 'express';
import { getLab, getLabMembers } from '../controllers/lab/lab.controller';



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

export default router;