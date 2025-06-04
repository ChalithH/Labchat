import { Router } from 'express';
import { getInventory, takeItem, getAllLowStockItems, replenishStock, getInventoryLocal, getInventoryItemByName, getItemTags } from "../controllers/inventory/inventory.controller";
import { requirePermission } from '../middleware/permission.middleware';

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management API
 */
const router = Router();

// Async wrapper to catch errors and pass them to error handler
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/item-tags', asyncHandler(getItemTags)); 

// Keep other specific routes before the general one as well
router.get('/name/:name', asyncHandler(getInventoryItemByName));
router.get('/low-stock', asyncHandler(getAllLowStockItems));
router.get('/local', asyncHandler(getInventoryLocal));

// Now define the general route with the parameter
router.get('/:labId', asyncHandler(getInventory)); 

router.post('/take', requirePermission(0), asyncHandler(takeItem));
router.post('/replenish', requirePermission(0), asyncHandler(replenishStock));

export default router;