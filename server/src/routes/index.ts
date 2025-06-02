import { Router } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import inventoryRoutes from './inventory.routes';
import roleRoutes from './role.routes';
import profileRoutes from './profile.routes';
import discussionRoutes from './discussion.routes';
import calendarRoutes from './calendar.routes';
import labRoutes from './lab.routes';
import memberRoutes from './member.routes';

import adminRoutes from './admin.routes';
import labAdmissionRoutes from './labAdmission.routes'; 
import notificationRoutes from './notification.routes';

const router = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: API root endpoint
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 docs:
 *                   type: string
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Express TypeScript API',
    docs: '/api-docs'
  });
});

router.use('/auth', authRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/discussion', discussionRoutes);
router.use('/profile', profileRoutes);
router.use('/calendar', calendarRoutes);
router.use('/lab', labRoutes);
router.use('/labAdmission', labAdmissionRoutes);
router.use('/admin', adminRoutes);
router.use('/notification', notificationRoutes);
// Models
router.use('/user', userRoutes);
router.use('/member', memberRoutes);
router.use('/role', roleRoutes);


export default router;