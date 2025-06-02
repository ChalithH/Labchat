import { Router } from 'express';
import { assignMember, createEvent, updateEvent, removeMember, deleteEvent, getLabEvents, getEventTypes, getMemberEvents, getInstruments, getSingleEvent }  from '../controllers/calendar/calendar.controller';

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

router.get('/events/:labId', getLabEvents);
router.get('/member-events/:labId/:memberId', getMemberEvents);
router.get('/getEventTypes', getEventTypes)
router.get('/get-instruments', getInstruments)
router.get('/event/:eventId', getSingleEvent)

export default router;