import { Router } from 'express';
import { getLab } from '../controllers/lab/lab.controller';



/**
 * @swagger
 * tags:
 *   name: Lab
 *   description: Lab management API
 */
const router = Router();


// Contacts
router.get('/:labId', getLab); 

export default router;