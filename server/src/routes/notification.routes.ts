import { Router } from 'express';
import { sendNotifcation } from '../controllers/notification/notification.controller';

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notificaiton management API
 */
const router = Router();


router.post('/test/:id', sendNotifcation);

export default router;