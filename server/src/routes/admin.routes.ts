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

// /api/admin/
router.get('/get-labs', requirePermission(60), getAllLabs);
router.get('/get-lab{id}', getLabById);
router.post('/create-lab', createLab);
router.post('/assign-user', assignUserToLab);
router.post('/update-role', updateRole);
router.put('/reset-password', resetUserPassword);
router.delete('/remove-user', removeUserFromLab);
router.post('/create-discussion-tag', createDiscussionTag);
router.post('/create-discussion-category', createDiscussionCategory);
router.post('/create-inventory-tag', createInventoryTag);
router.post('/create-inventory-item', createInventoryItem);

export default router;

function requirePermissiom(arg0: number): import("express-serve-static-core").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>> {
    throw new Error('Function not implemented.');
}
