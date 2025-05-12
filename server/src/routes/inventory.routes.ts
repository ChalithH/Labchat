import { Router } from 'express';
import { getInventory, takeItem, getAllLowStockItems, replenishStock, getInventoryLocal, getInventoryItemByName, getItemTags } from "../controllers/inventory/inventory.controller";

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management API
 */
const router = Router();

router.get('/item-tags', getItemTags); // <-- Place the specific '/item-tags' route first

// Keep other specific routes before the general one as well
router.get('/name/:name', getInventoryItemByName);
router.get('/low-stock', getAllLowStockItems);
router.get('/local', getInventoryLocal);

// Now define the general route with the parameter
router.get('/:labId', getInventory); // <-- Place the general '/:labId' route later

// POST routes ordering usually doesn't conflict with GET like this, but good practice
// is to group similar types or maintain a logical order.
router.post('/take', takeItem);
router.post('/replenish', replenishStock);


export default router;