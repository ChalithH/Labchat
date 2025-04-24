import { Router } from 'express';
import { assignMember, createEvent, updateEvent, removeMember, deleteEvent, getTasks, getMemberTasks, getInstrumentBookings, getMemberBookings }  from '../controllers/calendar/calendar.controller';

/**
 * @swagger
 * tags:
 *   name: Calendar
 *   description: Calendar API
 */
const router = Router();

router.post('/create-event', createEvent);
router.put('/update-event', updateEvent);
router.delete('/delete-event', deleteEvent);
router.post('/assign-member', assignMember);
router.delete('/remove-member', removeMember);

router.get('/get-tasks/:labId', getTasks);
router.get('/get-member-tasks/:labId/:memberId', getMemberTasks);
router.get('/get-instrument-events/:labId', getInstrumentBookings);
router.get('/get-member-instrument-events/:labId/:memberId', getMemberBookings);

export default router;