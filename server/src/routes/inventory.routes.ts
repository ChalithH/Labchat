import { Router } from 'express';
import { getInventory, takeItem, getAllLowStockItems } from "../controllers/inventory/inventory.controller";
import { requirePermission } from '../middleware/permission.middleware';

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management API
 */
const router = Router();

router.get('/', getInventory);
router.post('/take', takeItem);
router.get('/low-stock', getAllLowStockItems);

export default router;