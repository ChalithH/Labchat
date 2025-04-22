import { Router } from 'express';
import { assignMember, createEvent, updateEvent, removeMember }  from '../controllers/calendar/calendar.controller';

/**
 * @swagger
 * tags:
 *   name: Calendar
 *   description: Calendar API
 */
const router = Router();

router.post('/create-event', createEvent);
router.put('/update-event', updateEvent);
router.post('/assign-member', assignMember);
router.delete('/remove-member', removeMember);

export default router;