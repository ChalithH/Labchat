import { Router } from 'express';

import { 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    assignMember, 
    removeMember 
} from '../controllers/calendar/crud.controller';

import { 
    getEventTypes, 
    getInstruments 
} from '../controllers/calendar/constants.controller';

import {
    changeEventStatus,
    getEventStatuses
} from '../controllers/calendar/status.controller';


import { 
    getLabEvents, 
    getMemberEvents, 
    getSingleEvent 
} from '../controllers/calendar/event.controller';

/**
 * @swagger
 * tags:
 *   name: Calendar
 *   description: Calendar API
 */
const router = Router();

// CRUD Operations (Create, Update, Delete, Assign, Remove)
router.post('/create-event', createEvent);
router.put('/update-event', updateEvent);
router.delete('/delete-event', deleteEvent);
router.post('/assign-member', assignMember);
router.delete('/remove-member', removeMember);

// Event Retrieval Operations
router.get('/events/:labId', getLabEvents);
router.get('/member-events/:labId/:memberId', getMemberEvents);
router.get('/event/:eventId', getSingleEvent);

// Status Operations
router.put('/change-status', changeEventStatus);
router.get('/get-statuses', getEventStatuses);

// Constants/Reference Data Operations
router.get('/getEventTypes', getEventTypes);
router.get('/get-instruments', getInstruments);

export default router;