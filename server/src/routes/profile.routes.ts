import { Router } from 'express';
import { getContactsByUserId, getContacts, addContact, deleteContactById, editContactById } from '../controllers/profile/profile.controller';

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
router.put('/edit/:id', editContactById);
router.post('/add', addContact);
router.delete('/delete/:id', deleteContactById);


export default router;