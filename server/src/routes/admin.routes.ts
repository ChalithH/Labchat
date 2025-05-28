import { Router } from 'express';

import  {getAllLabs, getLabById, createLab, assignUserToLab,
         updateRole, resetUserPassword, removeUserFromLab,
          createDiscussionTag, createDiscussionCategory, getAllItems, createInventoryTag,
           createInventoryItem,
           createGlobalItem,
           updateItem,
           deleteItem,
           updateLab,
           getAllLabRoles,
           activateMemberStatus,
           updateMemberStatus,
           deleteMemberStatus,
           createMemberStatusForLabMember,
           updateLabMemberRole,
           toggleLabMemberInduction,
           toggleLabMemberPCI
           } from '../controllers/admin/admin.controller';

import { requirePermission } from '../middleware/permission.middleware';

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
router.get('/get-lab-roles', requirePermission(60), getAllLabRoles); 


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

router.post('/create-discussion-tag', requirePermission(60), createDiscussionTag);
router.post('/create-discussion-category', requirePermission(60), createDiscussionCategory);


router.get('/get-all-items', requirePermission(100), getAllItems);

router.post('/create-global-item', requirePermission(100), createGlobalItem); 

router.put("/update-item/:id", updateItem); // TODO: Add requirePermission(100) or verify in controller

router.delete("/delete-item/:id", deleteItem); // TODO: Add requirePermission(100) or verify in controller


// Create a new tag for inventory items (potentially lab-specific or global based on controller)
router.post('/create-inventory-tag', requirePermission(60), createInventoryTag);
// Create a new inventory item instance within a lab (associates a global item with a lab)
router.post('/create-inventory-item', requirePermission(60), createInventoryItem);
// TODO: Change item threshold in lab
export default router;
