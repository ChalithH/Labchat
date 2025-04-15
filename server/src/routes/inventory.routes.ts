import { Router } from 'express';
import { getInventory } from "../controllers/inventory/inventory.controller";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */
const router = Router();

router.get('/', getInventory);

export default router;