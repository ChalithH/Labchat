import { Router } from 'express';
import { PERMISSIONS } from '../config/permissions';

// Import from new modular controllers
import * as LabController from '../controllers/admin/lab.controller';
import * as LabMemberController from '../controllers/admin/labMember.controller';
import * as MemberStatusController from '../controllers/admin/memberStatus.controller';
import * as GlobalInventoryController from '../controllers/admin/globalInventory.controller';
import * as LabInventoryController from '../controllers/admin/labInventory.controller';
import * as ItemTagController from '../controllers/admin/itemTag.controller';
import * as LabRoleController from '../controllers/admin/labRole.controller';
import * as DiscussionController from '../controllers/admin/discussion.controller';
import * as InstrumentController from '../controllers/admin/instrument.controller';

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
router.get('/get-labs', requirePermission(PERMISSIONS.GLOBAL_ADMIN), LabController.getAllLabs); 
router.get('/get-lab/:id', requirePermission(0), LabController.getLabById); 
router.put('/lab/:id', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), LabController.updateLab); // Lab managers (70+) or global admin
router.delete('/lab/:id', requirePermission(PERMISSIONS.GLOBAL_ADMIN), LabController.deleteLab); // Only global admins can delete labs
router.get('/get-lab-roles', requirePermission(0), LabRoleController.getAllLabRoles); // Anyone authenticated can view roles
router.post('/create-lab-role', requirePermission(0), LabRoleController.createLabRole); 

// Member status management - should be lab-specific with extraction middleware
router.put('/member-status/:memberStatusId/activate', extractLabIdFromMemberStatus(), requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), MemberStatusController.activateMemberStatus);
router.put('/member-status/:memberStatusId', extractLabIdFromMemberStatus(), requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), MemberStatusController.updateMemberStatus);
router.delete('/member-status/:memberStatusId', extractLabIdFromMemberStatus(), requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), MemberStatusController.deleteMemberStatus);
router.post('/lab-member/:labMemberId/status', extractLabIdFromLabMember(), requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), MemberStatusController.createMemberStatusForLabMember);

// Lab member management - should be lab-specific with extraction middleware
router.put('/lab-member/:labMemberId/role', extractLabIdFromLabMember(), requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), LabMemberController.updateLabMemberRole);
router.put('/lab-member/:labMemberId/induction', extractLabIdFromLabMember(), requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), LabMemberController.toggleLabMemberInduction);
router.put('/lab-member/:labMemberId/pci', extractLabIdFromLabMember(), requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), LabMemberController.toggleLabMemberPCI);

// Remove user from lab (soft delete) - extracts labId from request body
router.delete('/remove-user', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), LabMemberController.removeUserFromLab);

// Admin stuff
router.post('/create-lab', requirePermission(PERMISSIONS.GLOBAL_ADMIN), LabController.createLab);


// Lab-specific password reset (requires lab manager permissions or admin)
router.put('/lab/:labId/reset-member-password', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), LabMemberController.resetLabMemberPassword);


router.post('/create-discussion-category', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), DiscussionController.createDiscussionCategory);
router.put('/lab/:labId/update-discussion/:discussionId', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), DiscussionController.updateDiscussionCategory);

// Lab Inventory Management stuff - Lab managers or global admins only
router.post('/lab/:labId/inventory', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), LabInventoryController.addItemToLab);
router.put('/lab/:labId/inventory/:itemId', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), LabInventoryController.updateLabInventoryItem);
router.delete('/lab/:labId/inventory/:itemId', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), LabInventoryController.removeItemFromLab);
router.post('/lab/:labId/inventory/:itemId/tags', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), ItemTagController.addTagsToLabItem);
router.delete('/lab/:labId/inventory/:itemId/tags/:tagId', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), ItemTagController.removeTagFromLabItem);

// Get inventory logs for a lab - Changed to use requireLabPermission for proper lab-specific access control
router.get('/lab/:labId/inventory-logs', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), LabInventoryController.getLabInventoryLogs);

router.post('/tags', requirePermission(0), ItemTagController.createTag);  // Permission check handled in controller - lab managers or global admins can create global tags
// Update an existing global tag (admin only)
router.put('/tags/:tagId', requirePermission(PERMISSIONS.GLOBAL_ADMIN), ItemTagController.updateTag);
// Delete a global tag (admin only)
router.delete('/tags/:tagId', requirePermission(PERMISSIONS.GLOBAL_ADMIN), ItemTagController.deleteTag);

// Lab member management
router.get('/lab/:labId/available-users', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), LabMemberController.getAvailableUsersForLab);
router.post('/lab/:labId/add-user', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), LabMemberController.addUserToLabEndpoint);

// TODO: Change item threshold in lab

// Global Inventory endpoints
router.get('/get-all-items', requirePermission(PERMISSIONS.GLOBAL_ADMIN), GlobalInventoryController.getAllItems);
router.get('/get-available-items-for-lab/:labId', requireLabPermission(PERMISSIONS.LAB_MANAGER, PERMISSIONS.GLOBAL_ADMIN), GlobalInventoryController.getAvailableItemsForLab);
router.post('/create-global-item', requirePermission(PERMISSIONS.GLOBAL_ADMIN), GlobalInventoryController.createGlobalItem); 
router.put("/update-item/:id", requirePermission(PERMISSIONS.GLOBAL_ADMIN), GlobalInventoryController.updateItem);
router.delete("/delete-item/:id", requirePermission(PERMISSIONS.GLOBAL_ADMIN), GlobalInventoryController.deleteItem);

// Instrument endpoints
router.get('/get-all-instruments', requirePermission(PERMISSIONS.GLOBAL_ADMIN), InstrumentController.getAllInstruments);
router.post('/create-instrument', requirePermission(PERMISSIONS.GLOBAL_ADMIN), InstrumentController.createInstrument);

export default router;
