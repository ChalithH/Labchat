import { Router } from 'express';
import { getContactsByUserId, getContacts } from '../controllers/profile/profile.controller';

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Profile management API
 */
const router = Router();


// Contacts
router.get('/get', getContacts);
router.get('/get/:id', getContactsByUserId);

export default router;