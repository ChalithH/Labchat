import { Router } from 'express';
import userRoutes from './models/user.routes';
import authRoutes from './auth.routes';
import inventoryRoutes from './inventory.routes';
import roleRoutes from './models/role.routes';

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

// Models
router.use('/user', userRoutes);
router.use('/role', roleRoutes);


export default router;