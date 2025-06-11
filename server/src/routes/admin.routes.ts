import { Router } from 'express';
import { PERMISSIONS } from '../config/permissions';

import  {getAllLabs, getLabById, createLab,
         resetLabMemberPassword,
         removeUserFromLab,
          createDiscussionCategory, updateDiscussionCategory, getAllItems,
           getAvailableItemsForLab, createGlobalItem,
           updateItem,
           deleteItem,
           updateLab,
           deleteLab,
           getAllLabRoles,
           createLabRole,
           activateMemberStatus,
           updateMemberStatus,
           deleteMemberStatus,
           createMemberStatusForLabMember,
           updateLabMemberRole,
           toggleLabMemberInduction,
           toggleLabMemberPCI,
           addItemToLab,
           updateLabInventoryItem,
           removeItemFromLab,
           addTagsToLabItem,
           removeTagFromLabItem,
           createTag,
           updateTag,
           deleteTag,
           getLabInventoryLogs,
           getAvailableUsersForLab,
           addUserToLabEndpoint,
           getAllInstruments,
           createInstrument
           } from '../controllers/admin/admin.controller';

import { requirePermission, requireLabPermission, extractLabIdFromLabMember, extractLabIdFromMemberStatus } from '../middleware/permission.middleware';

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administration panel and lab management specific APIs. Requires various permission levels.
 */
const router = Router();

// Permission Level Guide:
// - Lab-specific permissions: Use requireLabPermission()
//   - LAB_MANAGER (70): Lab management tasks within a specific lab
//   - LAB_MEMBER (0): Basic lab member access
// - Global permissions: Use requirePermission()
//   - GLOBAL_ADMIN (100): System-wide administration
// Note: Global admins (100) automatically have full access to all labs

// --- Lab Management (Permission Level: 60+) ---
router.get('/get-labs', requirePermission(PERMISSIONS.GLOBAL_ADMIN), getAllLabs); 
router.get('/get-lab/:id', requirePermission(0), getLabById); 
router.put('/lab/:id', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), updateLab); // Lab managers (70+) or global admin
router.delete('/lab/:id', requirePermission(PERMISSIONS.GLOBAL_ADMIN), deleteLab); // Only global admins can delete labs
router.get('/get-lab-roles', requirePermission(0), getAllLabRoles); // Anyone authenticated can view roles
router.post('/create-lab-role', requirePermission(0), createLabRole); 

// Member status management - should be lab-specific with extraction middleware
router.put('/member-status/:memberStatusId/activate', extractLabIdFromMemberStatus(), requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), activateMemberStatus);
router.put('/member-status/:memberStatusId', extractLabIdFromMemberStatus(), requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), updateMemberStatus);
router.delete('/member-status/:memberStatusId', extractLabIdFromMemberStatus(), requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), deleteMemberStatus);
router.post('/lab-member/:labMemberId/status', extractLabIdFromLabMember(), requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), createMemberStatusForLabMember);

// Lab member management - should be lab-specific with extraction middleware
router.put('/lab-member/:labMemberId/role', extractLabIdFromLabMember(), requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), updateLabMemberRole);
router.put('/lab-member/:labMemberId/induction', extractLabIdFromLabMember(), requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), toggleLabMemberInduction);
router.put('/lab-member/:labMemberId/pci', extractLabIdFromLabMember(), requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), toggleLabMemberPCI);

// Remove user from lab (soft delete) - extracts labId from request body
router.delete('/remove-user', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), removeUserFromLab);

// Admin stuff
router.post('/create-lab', requirePermission(PERMISSIONS.GLOBAL_ADMIN), createLab);


// Lab-specific password reset (requires lab manager permissions or admin)
router.put('/lab/:labId/reset-member-password', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), resetLabMemberPassword);


router.post('/create-discussion-category', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), createDiscussionCategory);
router.put('/lab/:labId/update-discussion/:discussionId', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), updateDiscussionCategory);

// Lab Inventory Management stuff - Lab managers or global admins only
router.post('/lab/:labId/inventory', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), addItemToLab);
router.put('/lab/:labId/inventory/:itemId', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), updateLabInventoryItem);
router.delete('/lab/:labId/inventory/:itemId', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), removeItemFromLab);
router.post('/lab/:labId/inventory/:itemId/tags', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), addTagsToLabItem);
router.delete('/lab/:labId/inventory/:itemId/tags/:tagId', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), removeTagFromLabItem);

// Get inventory logs for a lab - Changed to use requireLabPermission for proper lab-specific access control
router.get('/lab/:labId/inventory-logs', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), getLabInventoryLogs);

router.post('/tags', requirePermission(0), createTag);  // Permission check handled in controller - lab managers or global admins can create global tags
// Update an existing global tag (admin only)
router.put('/tags/:tagId', requirePermission(PERMISSIONS.GLOBAL_ADMIN), updateTag);
// Delete a global tag (admin only)
router.delete('/tags/:tagId', requirePermission(PERMISSIONS.GLOBAL_ADMIN), deleteTag);

// Lab member management
router.get('/lab/:labId/available-users', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), getAvailableUsersForLab);
router.post('/lab/:labId/add-user', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), addUserToLabEndpoint);

// TODO: Change item threshold in lab

// Global Inventory endpoints
router.get('/get-all-items', requirePermission(PERMISSIONS.GLOBAL_ADMIN), getAllItems);
router.get('/get-available-items-for-lab/:labId', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), getAvailableItemsForLab);
router.post('/create-global-item', requirePermission(PERMISSIONS.GLOBAL_ADMIN), createGlobalItem); 
router.put("/update-item/:id", requirePermission(PERMISSIONS.GLOBAL_ADMIN), updateItem);
router.delete("/delete-item/:id", requirePermission(PERMISSIONS.GLOBAL_ADMIN), deleteItem);

// Instrument endpoints
router.get('/get-all-instruments', requirePermission(PERMISSIONS.GLOBAL_ADMIN), getAllInstruments);
router.post('/create-instrument', requirePermission(PERMISSIONS.GLOBAL_ADMIN), createInstrument);

export default router;
