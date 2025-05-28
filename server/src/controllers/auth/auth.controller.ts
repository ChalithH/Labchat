import { NextFunction, Request, Response } from 'express';
import { User } from '@prisma/client';
import passport from 'passport';

import '../../middleware/local_strategy.middleware'
import { prisma } from '../..';


/*
 * LOGIN
 * Authenticates a user session using Passport.js local strategy.
 * 
 * Expected body fields:
 *   loginEmail    : User's email for login.
 *   loginPassword : User's password for login.
 * 
 * Responses:
 *   200 : Login successful, user session created.
 *   401 : Authentication failed (e.g., bad credentials, error during auth).
 *   500 : Internal server error during login process or user not found post-auth.
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  // Authenticate using 'local' strategy (defined in local_strategy.middleware)
  passport.authenticate('local', async (err: Error | { message: string } | null, userId: number | false | null) => {
    // This callback is executed after the local strategy attempts to authenticate.
    // userId will be the user's ID if authentication was successful, false/null otherwise.
       
    if (err) {
      const errorMessage = (err as { message: string }).message || 'Authentication failed due to an error';
      console.error('Passport authentication error:', errorMessage, err);
      res.status(401).json({ error: errorMessage });
      return;
    }

    if (!userId) {
      // This case should ideally be caught by the strategy sending an error or info, 
      // but as a safeguard if strategy returns no user without an error.
      console.warn('Passport authentication returned no user ID and no error.');
      res.status(401).json({ error: 'Invalid credentials or user not found' });
      return;
    }

    // Fetch the authenticated user details from database
    const user: User | null = await prisma.user.findUnique({ where: { id: userId }});
    
    if (!user) {
      // This should be rare if passport.authenticate returned a valid userId.
      console.error('User not found in database for ID provided by Passport:', userId);
      return res.status(500).json({ error: 'User authentication data inconsistent' });
    }

    // Establish a login session for the user
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('Error establishing login session:', loginErr);
        res.status(500).json({ error: 'Login session could not be established' });
        return;
      }
      // Send only necessary, non-sensitive user info upon successful login
      res.status(200).json({ message: 'Login successful', userId: user.id, lastViewed: user.lastViewed });
      return;
    });
  }) (req, res, next);
}


/*
 * LOGOUT
 * Destroys the current user session if one exists.
 * 
 * Responses:
 *   200 : Logout successful, session destroyed.
 *   400 : No active session found to logout.
 *   500 : Internal error during session destruction.
 */
export const logout = (req: Request, res: Response): void => {
  // req.user is populated by Passport if a session is active.
  if (!req.user) {
    res.status(400).send({ msg: 'No active user session found' });
    return; 
  }

  // Attempt to destroy the user session
  req.logout( (err) => {
    if (err) {
      console.error('Error during logout:', err);
      res.status(500).send({ error: 'Failed to logout due to server error' });
      return;
    }
    
    // Ensure client-side session cookie is cleared if `req.session.destroy` is not automatically doing it.
    // Express-session typically handles cookie removal on session.destroy().
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error('Error destroying session data:', destroyErr);
        // Still send 200 as logout was processed by req.logout(), but log the issue.
      }
      res.status(200).send({ msg: 'Successfully logged out' });
    });
  });
}


/*
 * STATUS
 * Returns the current authenticated user's data if a session exists.
 * Used by the client to verify authentication state and get user info.
 * 
 * Responses:
 *   200 : Session active, user data returned.
 *   401 : No active session or user not authenticated.
 */
// TODO: Consider returning a DTO (Data Transfer Object) of the user 
//       to avoid exposing all user model fields, if not already handled.
export const status = async (req: Request, res: Response): Promise<void> => {
  // req.user contains the authenticated user object (or parts of it based on deserializeUser)
  if (req.user) {
    // Potentially fetch fresh user data or select specific fields to return
    // For now, sending req.user as is (ensure it's what you intend to expose)
    res.status(200).send(req.user);
    return;
  }

  res.status(401).send({ msg: 'User is not authenticated' });
}


/*
 * LOCKED (Example Route)
 * A dummy function to demonstrate usage of the requirePermission middleware.
 * Actual logic for protected resources would be more complex.
 * 
 * Responses:
 *   200 : Request successful (if permission check passed).
 */
export const locked = (req: Request, res: Response): void => {
  res.status(200).send({ msg: 'Access granted to protected resource' });
}

// Permission levels should ideally be imported from a shared configuration file.
const ROOT_ADMIN_PERMISSION_LEVEL = 100; 
const LAB_MANAGER_PERMISSION_LEVEL = 70; 

/*
 * CHECK LAB ACCESS PERMISSION
 * Verifies if the authenticated user is authorized to manage a specific lab.
 * Authorization is granted if the user is a global Root Admin OR
 * a Lab Manager for the specified lab with sufficient permissions.
 * 
 * Path Parameters:
 *   labId: The ID of the lab for which access is being checked.
 * 
 * Responses:
 *   200 : User is authorized (returns authorized: true, and role flags).
 *   400 : Invalid lab ID provided.
 *   401 : User not authenticated (no session).
 *   403 : User authenticated but not authorized for this lab, or role not found.
 *   500 : Internal server error during the authorization check.
 */
export const checkLabAccessPermission = async (req: Request, res: Response): Promise<void> => {
  try {
    

    let sessionUserId: number | undefined;

    
    if (typeof req.user === 'number') {
      sessionUserId = req.user;
    } else if (req.user && typeof (req.user as any).id === 'number') {
      sessionUserId = (req.user as any).id;
    } 
    // else { console.log('[checkLabAccessPermission] Could not determine sessionUserId from req.user:', req.user); }

    const labIdStr = req.params.labId;
    const labId = parseInt(labIdStr, 10);

    let authorized = false;
    let isRootAdmin = false;
    let isLabManager = false;

    if (!sessionUserId) {
      res.status(401).json({ authorized, isRootAdmin, isLabManager, error: 'User not authenticated' });
      return;
    }

    if (isNaN(labId)) {
      res.status(400).json({ authorized, isRootAdmin, isLabManager, error: `Invalid lab ID: ${labIdStr}` });
      return;
    }

    // Fetch user with their global role for permission checks
    const userWithRole = await prisma.user.findUnique({
      where: { id: sessionUserId },
      include: { role: true }, // Include the global Role object
    });

    if (!userWithRole || !userWithRole.role) {
      // Should not happen if user is authenticated and data is consistent
      console.error(`User role not found for authenticated user ID: ${sessionUserId}`);
      res.status(403).json({ authorized, isRootAdmin, isLabManager, error: 'User role information missing' });
      return;
    }

    // Check for global root admin privileges
    if (userWithRole.role.permissionLevel >= ROOT_ADMIN_PERMISSION_LEVEL) {
      isRootAdmin = true;
    }

    // Check for specific lab manager role for the given lab
    const labMembership = await prisma.labMember.findFirst({
      where: {
        userId: sessionUserId,
        labId: labId,
      },
      include: { labRole: true }, // Include the lab-specific LabRole object
    });

    if (labMembership && labMembership.labRole && labMembership.labRole.permissionLevel >= LAB_MANAGER_PERMISSION_LEVEL) {
      isLabManager = true;
    }

    // User is authorized if they are a root admin OR a manager of this specific lab
    authorized = isRootAdmin || isLabManager;

    if (authorized) {
      res.status(200).json({ authorized, isRootAdmin, isLabManager });
    } else {
      res.status(403).json({ authorized, isRootAdmin, isLabManager, error: 'User does not have sufficient permissions for this lab' });
    }

  } catch (error) {
    console.error('Critical error in checkLabAccessPermission:', error);
    res.status(500).json({ authorized: false, isRootAdmin: false, isLabManager: false, error: 'Internal server error during authorization' });
  }
};