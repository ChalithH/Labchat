import { Router } from 'express';
import { getInventory, takeItem, getAllLowStockItems, replenishStock, getInventoryLocal } from "../controllers/inventory/inventory.controller";

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
router.post('/replenish', replenishStock)
router.get('//local', getInventoryLocal);

export default router;