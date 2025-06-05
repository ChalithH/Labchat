import { Router } from 'express';

import  {getAllLabs, getLabById, createLab, assignUserToLab,
         updateRole, resetUserPassword, resetLabMemberPassword, removeUserFromLab,
          createDiscussionTag, createDiscussionCategory, getAllItems,
           createGlobalItem,
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
           addUserToLabEndpoint
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
// - 60: Lab Manager or higher (e.g., general lab management tasks)
// - 100: Admin or higher (e.g., site-wide configurations, global item management)
// - 170: Super Admin / Root (e.g., user role updates, password resets - potentially higher level than 100)

// --- Lab Management (Permission Level: 60+) ---
router.get('/get-labs', requirePermission(60), getAllLabs); 
router.get('/get-lab/:id', requirePermission(0), getLabById); 
router.put('/lab/:id', requireLabPermission(70, 60), updateLab); // Lab managers (70+) or global admin
router.delete('/lab/:id', requirePermission(100), deleteLab); // Only global admins can delete labs
router.get('/get-lab-roles', requirePermission(0), getAllLabRoles); // Anyone authenticated can view roles
router.post('/create-lab-role', requirePermission(0), createLabRole); 

// Member status management - should be lab-specific with extraction middleware
router.put('/member-status/:memberStatusId/activate', extractLabIdFromMemberStatus(), requireLabPermission(70, 60), activateMemberStatus);
router.put('/member-status/:memberStatusId', extractLabIdFromMemberStatus(), requireLabPermission(70, 60), updateMemberStatus);
router.delete('/member-status/:memberStatusId', extractLabIdFromMemberStatus(), requireLabPermission(70, 60), deleteMemberStatus);
router.post('/lab-member/:labMemberId/status', extractLabIdFromLabMember(), requireLabPermission(70, 60), createMemberStatusForLabMember);

// Lab member management - should be lab-specific with extraction middleware
router.put('/lab-member/:labMemberId/role', extractLabIdFromLabMember(), requireLabPermission(70, 60), updateLabMemberRole);
router.put('/lab-member/:labMemberId/induction', extractLabIdFromLabMember(), requireLabPermission(70, 60), toggleLabMemberInduction);
router.put('/lab-member/:labMemberId/pci', extractLabIdFromLabMember(), requireLabPermission(70, 60), toggleLabMemberPCI);
router.delete('/remove-user', requireLabPermission(70, 60), removeUserFromLab);

// Admin stuff
router.post('/create-lab', requirePermission(100), createLab);
// Assign a user to a lab, set permission level properly later
router.post('/assign-user', requirePermission(170), assignUserToLab); 

router.post('/update-role', requirePermission(170), updateRole);

router.put('/reset-password', requirePermission(170), resetUserPassword);

// Lab-specific password reset (requires lab manager permissions or admin)
router.put('/lab/:labId/reset-member-password', requireLabPermission(70, 60), resetLabMemberPassword);

router.post('/create-discussion-tag', requirePermission(60), createDiscussionTag);
router.post('/create-discussion-category', requirePermission(60), createDiscussionCategory);

// Lab Inventory Management stuff - Permission checking handled in controllers
// Requires authentication (permission level = 0) but lab-specific logic handled in controllers
router.post('/lab/:labId/inventory', requirePermission(0), addItemToLab);
router.put('/lab/:labId/inventory/:itemId', requirePermission(0), updateLabInventoryItem);
router.delete('/lab/:labId/inventory/:itemId', requirePermission(0), removeItemFromLab);
router.post('/lab/:labId/inventory/:itemId/tags', requirePermission(0), addTagsToLabItem);
router.delete('/lab/:labId/inventory/:itemId/tags/:tagId', requirePermission(0), removeTagFromLabItem);

// Get inventory logs for a lab - Changed to use requireLabPermission for proper lab-specific access control
router.get('/lab/:labId/inventory-logs', requireLabPermission(60, 60), getLabInventoryLogs);

router.post('/tags', requirePermission(0), createTag);  // Lab managers can create tags - permission check in controller
// Update an existing global tag (admin only)
router.put('/tags/:tagId', requirePermission(60), updateTag);
// Delete a global tag (admin only)
router.delete('/tags/:tagId', requirePermission(60), deleteTag);

// Lab member management
router.get('/lab/:labId/available-users', requireLabPermission(70, 60), getAvailableUsersForLab);
router.post('/lab/:labId/add-user', requireLabPermission(70, 60), addUserToLabEndpoint);

// TODO: Change item threshold in lab

// Global Inventory endpoints
router.get('/get-all-items', requirePermission(100), getAllItems);
router.post('/create-global-item', requirePermission(100), createGlobalItem); 
router.put("/update-item/:id", updateItem);
router.delete("/delete-item/:id", deleteItem);
export default router;
