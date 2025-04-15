import { Router } from 'express';
import { getInventory, takeItem } from "../controllers/inventory/inventory.controller";

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management API
 */
const router = Router();

router.get('/', getInventory);
router.post('/take', takeItem);

export default router;