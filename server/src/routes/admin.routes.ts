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

import { requirePermission, requireLabPermission } from '../middleware/permission.middleware';

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
router.get('/get-lab/:id', requirePermission(60), getLabById); 
router.put('/lab/:id', requirePermission(60), updateLab); 
router.delete('/lab/:id', requirePermission(100), deleteLab);
router.get('/get-lab-roles', requirePermission(60), getAllLabRoles); 
router.post('/create-lab-role', requirePermission(60), createLabRole);

// Activate a specific MemberStatus entry (making others for the same user inactive)
router.put('/member-status/:memberStatusId/activate', requirePermission(60), activateMemberStatus);
// Update details of a specific MemberStatus entry (e.g., description)
router.put('/member-status/:memberStatusId', requirePermission(60), updateMemberStatus);
// Delete a specific MemberStatus entry
router.delete('/member-status/:memberStatusId', requirePermission(60), deleteMemberStatus);

router.post('/lab-member/:labMemberId/status', requirePermission(60), createMemberStatusForLabMember);


router.put('/lab-member/:labMemberId/role', requirePermission(60), updateLabMemberRole);
// Toggle a lab member's induction status (true/false)
router.put('/lab-member/:labMemberId/induction', requirePermission(60), toggleLabMemberInduction);

// Toggle a lab member's PCI status
router.put('/lab-member/:labMemberId/pci', requirePermission(60), toggleLabMemberPCI);

router.delete('/remove-user', requirePermission(60), removeUserFromLab); 

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


router.get('/get-all-items', requirePermission(60), getAllItems);

router.post('/items', requirePermission(100), createGlobalItem);
router.put('/items/:id', requirePermission(100), updateItem);
router.delete('/items/:id', requirePermission(100), deleteItem);

// Lab Inventory Management stuff - Permission checking handled in controllers
// Requires authentication (permission level = 0) but lab-specific logic handled in controllers
router.post('/lab/:labId/inventory', requirePermission(0), addItemToLab);
router.put('/lab/:labId/inventory/:itemId', requirePermission(0), updateLabInventoryItem);
router.delete('/lab/:labId/inventory/:itemId', requirePermission(0), removeItemFromLab);
router.post('/lab/:labId/inventory/:itemId/tags', requirePermission(0), addTagsToLabItem);
router.delete('/lab/:labId/inventory/:itemId/tags/:tagId', requirePermission(0), removeTagFromLabItem);

// Get inventory logs for a lab - Changed to use requireLabPermission for proper lab-specific access control
router.get('/lab/:labId/inventory-logs', requireLabPermission(60, 60), getLabInventoryLogs);

// Global Tag Management stuff
router.post('/tags', requirePermission(60), createTag);
// Update an existing global tag (admin only)
router.put('/tags/:tagId', requirePermission(100), updateTag);
// Delete a global tag (admin only)
router.delete('/tags/:tagId', requirePermission(100), deleteTag);

// Lab member management
router.get('/lab/:labId/available-users', requirePermission(60), getAvailableUsersForLab);
router.post('/lab/:labId/add-user', requirePermission(60), addUserToLabEndpoint);

// TODO: Change item threshold in lab
export default router;
