import { Router } from 'express';
import { clockIn, clockOut, getAttendanceStatus, getCurrentMembers } from '../controllers/attendance/attendance.controller';

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Lab attendance management API
 */
const router = Router();

// /api/attendance/
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/status', getAttendanceStatus);
router.get('/current-members', getCurrentMembers);

export default router;
