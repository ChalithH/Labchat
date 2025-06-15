import { PrismaClient, InventoryAction, InventorySource } from '@prisma/client';
import { Request } from 'express';
import { PERMISSIONS } from '../config/permissions';

const prisma = new PrismaClient();

interface InventoryLogData {
  labInventoryItemId: number;
  userId: number;
  memberId?: number;
  action: InventoryAction;
  source: InventorySource;
  previousValues?: any;
  newValues?: any;
  quantityChanged?: number;
  reason?: string;
}

/**
 * Get the user ID and lab member ID (if possible) for the authenticated user
 */
export const getUserAndMemberIdFromRequest = async (req: Request, labId: number): Promise<{ userId: number | null; memberId: number | null }> => {
  try {
    const sessionUserId = (req.session as any)?.passport?.user;
    
    if (!sessionUserId) {
      return { userId: null, memberId: null };
    }

    // Always try to find lab member relationship
    const labMember = await prisma.labMember.findFirst({
      where: {
        userId: sessionUserId,
        labId: labId,
      },
    });

    return { 
      userId: sessionUserId, 
      memberId: labMember?.id || null 
    };
  } catch (error) {
    console.error('Error getting user and member IDs:', error);
    return { userId: null, memberId: null };
  }
};

// Check if user is admin
export const getUserContextForLogging = async (req: Request, labId: number): Promise<{
  userId: number | null;
  memberId: number | null;
  source: InventorySource;
  isAdmin: boolean;
}> => {
  try {
    const sessionUserId = (req.session as any)?.passport?.user;
    
    if (!sessionUserId) {
      return { userId: null, memberId: null, source: InventorySource.API_DIRECT, isAdmin: false };
    }

    // Get user with global role
    const user = await prisma.user.findUnique({
      where: { id: sessionUserId },
      include: { role: true }
    });

    if (!user || !user.role) {
      return { userId: null, memberId: null, source: InventorySource.API_DIRECT, isAdmin: false };
    }

    const isAdmin = user.role.permissionLevel >= PERMISSIONS.GLOBAL_ADMIN; // Admin level threshold

    
    const labMember = await prisma.labMember.findFirst({
      where: {
        userId: sessionUserId,
        labId: labId,
      },
    });

    // Find where inventory 'action' is coming from (admin panel or lab inventory page)
    let source: InventorySource;
    
    if (req.path.includes('/admin/lab/')) {
      source = InventorySource.ADMIN_PANEL;
    } else if (labMember) {
      source = InventorySource.LAB_INTERFACE;
    } else {
      source = InventorySource.API_DIRECT;
    }

    return {
      userId: sessionUserId,
      memberId: labMember?.id || null,
      source,
      isAdmin
    };
  } catch (error) {
    console.error('Error getting user context for logging:', error);
    return { userId: null, memberId: null, source: InventorySource.API_DIRECT, isAdmin: false };
  }
};


export const getLabMemberIdFromRequest = async (req: Request, labId: number): Promise<number | null> => {
  const { memberId } = await getUserAndMemberIdFromRequest(req, labId);
  return memberId;
};


export const createInventoryLog = async (data: InventoryLogData): Promise<void> => {
  try {
    // Don't log if userId is missing
    if (!data.userId) {
      console.warn('Cannot create inventory log: userId is required');
      return;
    }

    await prisma.inventoryLog.create({
      data: {
        labInventoryItemId: data.labInventoryItemId,
        userId: data.userId,
        memberId: data.memberId || null,
        action: data.action,
        source: data.source,
        previousValues: data.previousValues || null,
        newValues: data.newValues || null,
        quantityChanged: data.quantityChanged || null,
        reason: data.reason || null,
      },
    });
  } catch (error) {
    console.error('Error creating inventory log:', error);
    // Don't throw error, action should still work if logging fails
  }
};

// Log replen stock
export const logStockAdd = async (
  labInventoryItemId: number,
  userId: number,
  previousStock: number,
  newStock: number,
  amountAdded: number,
  source: InventorySource,
  reason?: string,
  memberId?: number | null
): Promise<void> => {
  // Get the labId from the inventory item
  const inventoryItem = await prisma.labInventoryItem.findUnique({
    where: { id: labInventoryItemId },
    select: { labId: true }
  });
  
  await createInventoryLog({
    labInventoryItemId,
    userId,
    memberId: memberId ?? undefined,
    action: InventoryAction.STOCK_ADD,
    source,
    previousValues: { currentStock: previousStock, labId: inventoryItem?.labId },
    newValues: { currentStock: newStock, labId: inventoryItem?.labId },
    quantityChanged: amountAdded,
    reason,
  });
};

// Log take stock
export const logStockRemove = async (
  labInventoryItemId: number,
  userId: number,
  previousStock: number,
  newStock: number,
  amountRemoved: number,
  source: InventorySource,
  reason?: string,
  memberId?: number | null
): Promise<void> => {
  // Get the labId from the inventory item
  const inventoryItem = await prisma.labInventoryItem.findUnique({
    where: { id: labInventoryItemId },
    select: { labId: true }
  });
  
  await createInventoryLog({
    labInventoryItemId,
    userId,
    memberId: memberId ?? undefined,
    action: InventoryAction.STOCK_REMOVE,
    source,
    previousValues: { currentStock: previousStock, labId: inventoryItem?.labId },
    newValues: { currentStock: newStock, labId: inventoryItem?.labId },
    quantityChanged: -amountRemoved, // Negative for take
    reason,
  });
};

export const logStockUpdate = async (
  labInventoryItemId: number,
  userId: number,
  previousStock: number,
  newStock: number,
  source: InventorySource,
  reason?: string,
  memberId?: number | null
): Promise<void> => {
  const inventoryItem = await prisma.labInventoryItem.findUnique({
    where: { id: labInventoryItemId },
    select: { labId: true }
  });
  
  await createInventoryLog({
    labInventoryItemId,
    userId,
    memberId: memberId ?? undefined,
    action: InventoryAction.STOCK_UPDATE,
    source,
    previousValues: { currentStock: previousStock, labId: inventoryItem?.labId },
    newValues: { currentStock: newStock, labId: inventoryItem?.labId },
    quantityChanged: newStock - previousStock,
    reason,
  });
};

// Log location change
export const logLocationChange = async (
  labInventoryItemId: number,
  userId: number,
  previousLocation: string,
  newLocation: string,
  source: InventorySource,
  reason?: string,
  memberId?: number | null
): Promise<void> => {
  const inventoryItem = await prisma.labInventoryItem.findUnique({
    where: { id: labInventoryItemId },
    select: { labId: true }
  });
  
  await createInventoryLog({
    labInventoryItemId,
    userId,
    memberId: memberId ?? undefined,
    action: InventoryAction.LOCATION_CHANGE,
    source,
    previousValues: { location: previousLocation, labId: inventoryItem?.labId },
    newValues: { location: newLocation, labId: inventoryItem?.labId },
    reason,
  });
};

// Log min. threshold change
export const logMinStockUpdate = async (
  labInventoryItemId: number,
  userId: number,
  previousMinStock: number,
  newMinStock: number,
  source: InventorySource,
  reason?: string,
  memberId?: number | null
): Promise<void> => {
  const inventoryItem = await prisma.labInventoryItem.findUnique({
    where: { id: labInventoryItemId },
    select: { labId: true }
  });
  
  await createInventoryLog({
    labInventoryItemId,
    userId,
    memberId: memberId ?? undefined,
    action: InventoryAction.MIN_STOCK_UPDATE,
    source,
    previousValues: { minStock: previousMinStock, labId: inventoryItem?.labId },
    newValues: { minStock: newMinStock, labId: inventoryItem?.labId },
    reason,
  });
};

// Log global item addition to lab instance inventory
export const logItemAdded = async (
  labInventoryItemId: number,
  userId: number,
  itemData: any,
  source: InventorySource,
  reason?: string,
  memberId?: number | null
): Promise<void> => {
  await createInventoryLog({
    labInventoryItemId,
    userId,
    memberId: memberId ?? undefined,
    action: InventoryAction.ITEM_ADDED,
    source: InventorySource.ADMIN_PANEL,
    newValues: itemData,
    reason,
  });
};

// Log lab inventory item removal from lab instance inventory
export const logItemRemoved = async (
  labInventoryItemId: number,
  userId: number,
  itemData: any,
  source: InventorySource,
  reason?: string,
  memberId?: number | null
): Promise<void> => {
  await createInventoryLog({
    labInventoryItemId,
    userId,
    memberId: memberId ?? undefined,
    action: InventoryAction.ITEM_REMOVED,
    source: InventorySource.ADMIN_PANEL,
    previousValues: itemData,
    reason,
  });
};

// Log other item updates
export const logItemUpdate = async (
  labInventoryItemId: number,
  userId: number,
  previousValues: any,
  newValues: any,
  source: InventorySource,
  reason?: string,
  memberId?: number | null
): Promise<void> => {
  const inventoryItem = await prisma.labInventoryItem.findUnique({
    where: { id: labInventoryItemId },
    select: { labId: true }
  });
  
  await createInventoryLog({
    labInventoryItemId,
    userId,
    memberId: memberId ?? undefined,
    action: InventoryAction.ITEM_UPDATE,
    source,
    previousValues: { ...previousValues, labId: inventoryItem?.labId },
    newValues: { ...newValues, labId: inventoryItem?.labId },
    reason,
  });
};

/**
 * Get inventory logs for a specific lab with filtering options
 */
export const getInventoryLogsForLab = async (
  labId: number,
  options: {
    limit?: number;
    offset?: number;
    action?: InventoryAction;
    source?: InventorySource;
    startDate?: Date;
    endDate?: Date;
    userId?: number;
    memberId?: number;
  } = {}
) => {
  const {
    limit = 50,
    offset = 0,
    action,
    source,
    startDate,
    endDate,
    userId,
    memberId
  } = options;

  // Handle both existing items and deleted items
  const whereClause: any = {
    OR: [
      // for existing items
      {
        labInventoryItem: {
          labId: labId,
        },
      },
      // for deleted items (labInventoryItemId is null)
      // find labId from previousValues
      {
        AND: [
          {
            labInventoryItemId: null,
          },
          {
            previousValues: {
              path: ['labId'],
              equals: labId
            }
          }
        ]
      }
    ]
  };

  // Add additional filters
  const additionalFilters: any = {};

  if (action) {
    additionalFilters.action = action;
  }

  if (source) {
    additionalFilters.source = source;
  }

  if (startDate || endDate) {
    additionalFilters.createdAt = {};
    if (startDate) {
      additionalFilters.createdAt.gte = startDate;
    }
    if (endDate) {
      additionalFilters.createdAt.lte = endDate;
    }
  }

  if (userId) {
    additionalFilters.userId = userId;
  }

  if (memberId) {
    additionalFilters.memberId = memberId;
  }

  // Combine OR clause with additional filters using AND
  const finalWhereClause = Object.keys(additionalFilters).length > 0 
    ? {
        AND: [
          whereClause,
          additionalFilters
        ]
      }
    : whereClause;

  const [logs, totalCount] = await Promise.all([
    prisma.inventoryLog.findMany({
      where: finalWhereClause,
      include: {
        labInventoryItem: {
          include: {
            item: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
          },
        },
        member: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    }),
    prisma.inventoryLog.count({
      where: finalWhereClause,
    })
  ]);

  return {
    logs,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: Math.floor(offset / limit) + 1,
    hasNextPage: offset + limit < totalCount,
    hasPrevPage: offset > 0
  };
};

// Check user/member permissions for action
export const checkLabPermission = async (req: Request, labId: number, minimumLevel: number = 0, adminMinLevel: number = 60): Promise<{
  hasPermission: boolean;
  userId: number | null;
  memberId: number | null;
  source: InventorySource;
  isAdmin: boolean;
  error?: string;
}> => {
  try {
    const sessionUserId = (req.session as any)?.passport?.user;
    
    if (!sessionUserId) {
      return { 
        hasPermission: false, 
        userId: null, 
        memberId: null, 
        source: InventorySource.API_DIRECT, 
        isAdmin: false,
        error: 'Authentication required'
      };
    }

    // Get user with global role
    const user = await prisma.user.findUnique({
      where: { id: sessionUserId },
      include: { role: true }
    });

    if (!user || !user.role) {
      return { 
        hasPermission: false, 
        userId: null, 
        memberId: null, 
        source: InventorySource.API_DIRECT, 
        isAdmin: false,
        error: 'User or role not found'
      };
    }

    const isAdmin = user.role.permissionLevel >= adminMinLevel;

    // Check if user is a global admin
    if (isAdmin) {
      // Determine source based on request path
      const source = req.path.includes('/admin/lab/') ? InventorySource.ADMIN_PANEL : InventorySource.LAB_INTERFACE;
      
      const labMember = await prisma.labMember.findFirst({
        where: {
          userId: sessionUserId,
          labId: labId,
        },
      });

      return {
        hasPermission: true,
        userId: sessionUserId,
        memberId: labMember?.id || null,
        source,
        isAdmin: true
      };
    }

    // Check lab membership and lab role
    const labMember = await prisma.labMember.findFirst({
      where: {
        userId: sessionUserId,
        labId: labId,
      },
      include: {
        labRole: true
      }
    });

    if (!labMember || !labMember.labRole) {
      return {
        hasPermission: false,
        userId: sessionUserId,
        memberId: null,
        source: InventorySource.API_DIRECT,
        isAdmin: false,
        error: 'Access denied: You are not a member of this lab'
      };
    }

    // Check lab role permission
    if (labMember.labRole.permissionLevel < minimumLevel) {
      return {
        hasPermission: false,
        userId: sessionUserId,
        memberId: labMember.id,
        source: InventorySource.LAB_INTERFACE,
        isAdmin: false,
        error: `Insufficient lab permission. Required: ${minimumLevel}, Your lab role: ${labMember.labRole.permissionLevel}`
      };
    }

    return {
      hasPermission: true,
      userId: sessionUserId,
      memberId: labMember.id,
      source: InventorySource.LAB_INTERFACE,
      isAdmin: false
    };
  } catch (error) {
    console.error('Error checking lab permission:', error);
    return {
      hasPermission: false,
      userId: null,
      memberId: null,
      source: InventorySource.API_DIRECT,
      isAdmin: false,
      error: 'Permission check failed'
    };
  }
}; 