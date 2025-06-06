import { Request, Response, NextFunction } from 'express'
import { prisma } from '..'


export const requirePermission = (minimum_level: number) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const session_user_id = (req.session as any).passport.user

    const session_user = await prisma.user.findUnique({ where: { id: session_user_id}})

    const role = await prisma.role.findUnique({
      where: { id: (session_user as any).roleId }
    })

    if (!role) {
      res.status(500).send({ msg: 'Role not found' })
      return
    }

    console.log("SESSION USER PERM LEVEL:", role.permissionLevel)

    if (role.permissionLevel < minimum_level) {
      res.status(403).send({ msg: 'Insufficient permission' })
      return
    }

    next()
  }
}

// Lab specific permission middleware
// User admin overrides lab role permissions (full access)
// If not user role == admin, check lab role permissions
export const requireLabPermission = (minimum_level: number, adminMinLevel: number = 60) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const session_user_id = (req.session as any)?.passport?.user;
      
      if (!session_user_id) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Get user and their global role
      const user = await prisma.user.findUnique({ 
        where: { id: session_user_id },
        include: { role: true }
      });

      if (!user || !user.role) {
        res.status(500).json({ error: 'User or role not found' });
        return;
      }

      // Extract labId from request (can be in params/body/query)
      // Also check for id parameter for routes
      const labId = parseInt(
        req.params.labId || 
        req.params.id || 
        req.body.labId || 
        req.query.labId as string
      );
      
      if (!labId) {
        res.status(400).json({ error: 'Lab ID is required' });
        return;
      }

      console.log(`Checking lab permission for user ${session_user_id}, lab ${labId}, global role level: ${user.role.permissionLevel}`);

      // Check if user is a global admin
      if (user.role.permissionLevel >= adminMinLevel) {
        console.log('Access granted: Global admin user');
        // Add labId to request for controllers to use
        req.params.labId = labId.toString();
        next();
        return;
      }

      // Check lab membership and lab role
      const labMember = await prisma.labMember.findFirst({
        where: {
          userId: session_user_id,
          labId: labId,
        },
        include: {
          labRole: true
        }
      });

      if (!labMember || !labMember.labRole) {
        res.status(403).json({ error: 'Access denied: You are not a member of this lab' });
        return;
      }

      // Check lab role permission
      if (labMember.labRole.permissionLevel < minimum_level) {
        res.status(403).json({ 
          error: `Insufficient lab permission. Required: ${minimum_level}, Your lab role: ${labMember.labRole.permissionLevel}` 
        });
        return;
      }

      console.log(`Access granted: Lab member with role level ${labMember.labRole.permissionLevel}`);
      req.params.labId = labId.toString();
      next();
    } catch (error) {
      console.error('Error in requireLabPermission middleware:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  }
}

// Middleware will extract lab ID from lab member
export const extractLabIdFromLabMember = () => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const labMemberId = parseInt(req.params.labMemberId);
      
      if (!labMemberId || isNaN(labMemberId)) {
        next();
        return;
      }

      const labMember = await prisma.labMember.findUnique({
        where: { id: labMemberId },
        select: { labId: true }
      });

      if (labMember) {
        req.params.labId = labMember.labId.toString();
      }
      
      next();
    } catch (error) {
      console.error('Error extracting lab ID from lab member:', error);
      next();
    }
  }
}

export const extractLabIdFromMemberStatus = () => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const memberStatusId = parseInt(req.params.memberStatusId);
      
      if (!memberStatusId || isNaN(memberStatusId)) {
        next();
        return;
      }

      const memberStatus = await prisma.memberStatus.findUnique({
        where: { id: memberStatusId },
        select: {
          labMember: {
            select: { labId: true }
          }
        }
      });

      if (memberStatus?.labMember) {
        req.params.labId = memberStatus.labMember.labId.toString();
      }
      
      next();
    } catch (error) {
      console.error('Error extracting lab ID from member status:', error);
      next();
    }
  }
}