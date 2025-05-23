import { Router } from 'express';

import  {getAllLabs, getLabById, createLab, assignUserToLab,
         updateRole, resetUserPassword, removeUserFromLab,
          createDiscussionTag, createDiscussionCategory, createInventoryTag,
           createInventoryItem} from '../controllers/admin/admin.controller';

import { requirePermission } from '../middleware/permission.middleware';

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin Panel API
 */
const router = Router();

// Admin level: 
// Lab Manager level: 60
// /api/admin/
router.get('/get-labs', requirePermission(60), getAllLabs);
router.get('/get-lab{id}', requirePermission(60), getLabById);
router.post('/create-lab', requirePermission(170), createLab);
router.post('/assign-user', requirePermission(170), assignUserToLab);
router.post('/update-role', requirePermission(170), updateRole);
router.put('/reset-password', requirePermission(170), resetUserPassword);
router.delete('/remove-user', requirePermission(60), removeUserFromLab);
router.post('/create-discussion-tag', requirePermission(60), createDiscussionTag);
router.post('/create-discussion-category', requirePermission(60), createDiscussionCategory);
router.post('/create-inventory-tag', requirePermission(60), createInventoryTag);
router.post('/create-inventory-item', requirePermission(60), createInventoryItem);

export default router;

function requirePermissiom(arg0: number): import("express-serve-static-core").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>> {
    throw new Error('Function not implemented.');
}
