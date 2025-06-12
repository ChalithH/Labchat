/**
 * Global permission constants
 * 
 * This file defines the permission levels used throughout the application
 * The system uses a two-tier permission model:
 * 1. Global permissions (user.role.permissionLevel)
 * 2. Lab-specific permissions (labMember.labRole.permissionLevel)
 */

export const PERMISSIONS = {
  // Global permission levels
  GLOBAL_ADMIN: 100,              // Full system access
  
  // Lab-specific permission levels  
  LAB_MANAGER: 70,                // Lab management access within a specific lab
  LAB_MEMBER: 0,                  // Regular lab member access
  FORMER_MEMBER: -1,              // Soft deletion - former member with no access
} as const;

// Type for permission values
export type PermissionLevel = typeof PERMISSIONS[keyof typeof PERMISSIONS];