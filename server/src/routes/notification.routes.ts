import { Router } from 'express';
import { deleteAllNotifications, deleteNotification, getUserNotifications, markNotificationRead, sendNotifcation } from '../controllers/notification/notification.controller';

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notificaiton management API
 */
const router = Router();


router.post('/:id', sendNotifcation)
router.get('/:id', getUserNotifications)
router.delete('/:id', deleteNotification)
router.put('/read/:id', markNotificationRead)
router.delete('/clear-all/:userId', deleteAllNotifications)


export default router