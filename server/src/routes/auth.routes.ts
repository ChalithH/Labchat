import { Router } from 'express';

import { login, logout, locked, status, checkLabAccessPermission, checkAdminPermission } from '../controllers/auth/auth.controller';
import { requirePermission } from '../middleware/permission.middleware';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication, session management, and authorization checks.
 */
const router = Router();

// Base path: /api/auth

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loginEmail
 *               - loginPassword
 *             properties:
 *               loginEmail:
 *                 type: string
 *                 format: email
 *               loginPassword:
 *                 type: string
 *     responses:
 *       200: 
 *         description: "Login successful, session initiated."
 *       401: 
 *         description: "Authentication failed (invalid credentials or other auth error)."
 *       500: 
 *         description: "Internal server error during login."
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Log out the current user
 *     tags: [Auth]
 *     responses:
 *       200: 
 *         description: "Logout successful, session terminated."
 *       400: 
 *         description: "No active session to logout."
 *       500: 
 *         description: "Error during session destruction."
 */
router.get('/logout', logout);

/**
 * @swagger
 * /auth/status:
 *   get:
 *     summary: Check current authentication status and get user info
 *     tags: [Auth]
 *     responses:
 *       200: 
 *         description: "User is authenticated, returns user data."
 *       401: 
 *         description: "User is not authenticated."
 */
router.get('/status', status);

/**
 * @swagger
 * /auth/check-lab-access/{labId}:
 *   get:
 *     summary: Check if the current authenticated user has manager access to a specific lab.
 *     description: >
 *       Verifies if the session user is a global Root Admin or a Lab Manager 
 *       (with sufficient lab-specific permission level) for the given labId.
 *       This endpoint requires the user to be authenticated.
 *     tags: [Auth, Lab]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the lab for which access permission is being checked.
 *     responses:
 *       200: 
 *         description: "User is authorized. Response includes { authorized: true, isRootAdmin, isLabManager }"
 *       400: 
 *         description: "Invalid lab ID format."
 *       401: 
 *         description: "User not authenticated (no session)."
 *       403: 
 *         description: "User authenticated but not authorized for this lab. Response includes { authorized: false, ... }"
 *       500: 
 *         description: "Internal server error during authorization check."
 */
router.get('/check-lab-access/:labId', checkLabAccessPermission);

/**
 * @swagger
 * /auth/check-admin-permission:
 *   get:
 *     summary: Check if the current authenticated user has admin permission
 *     description: >
 *       Verifies if the session user has admin permission (permissionLevel >= 100).
 *       This endpoint requires the user to be authenticated.
 *     tags: [Auth]
 *     responses:
 *       200: 
 *         description: "User has admin permission. Response includes { hasAdminPermission: true }"
 *       401: 
 *         description: "User not authenticated (no session)."
 *       403: 
 *         description: "User authenticated but doesn't have admin permission. Response includes { hasAdminPermission: false, ... }"
 *       500: 
 *         description: "Internal server error during permission check."
 */
router.get('/check-admin-permission', checkAdminPermission);

/**
 * @swagger
 * /auth/locked:
 *   get:
 *     summary: Example protected route (requires permission level 20)
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: [] # Assumes you have a security scheme defined for session cookies
 *     responses:
 *       200: 
 *         description: "Access granted."
 *       401: 
 *         description: "Unauthorized (not authenticated or insufficient permissions)."
 */
// Example of a route protected by a specific permission level (20 in this case)
router.get('/locked', requirePermission(20), locked);

export default router;