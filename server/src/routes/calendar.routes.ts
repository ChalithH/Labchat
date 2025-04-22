import { Router } from 'express';
import { assignMember, createEvent, updateEvent, changeMembers }  from '../controllers/calendar/calendar.controller';

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
router.put('/change-members', changeMembers);

export default router;