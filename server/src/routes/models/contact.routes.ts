import { Router } from 'express';
import { getContactsByUserId, getContacts } from '../../controllers/models/contact/contact.controller';

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Contact management API
 */
const router = Router();


router.get('/get', getContacts);
router.get('/get/:id', getContactsByUserId);

export default router;