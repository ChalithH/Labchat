import { Router } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import inventoryRoutes from './inventory.routes';
import calendarRoutes from './calendar.routes';

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

router.use('/user', userRoutes);
router.use('/auth', authRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/calendar', calendarRoutes);

export default router;