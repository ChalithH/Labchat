/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the user
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *         name:
 *           type: string
 *           description: The user's name
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the user was last updated
 *       example:
 *         id: 1
 *         email: user@example.com
 *         name: John Doe
 *         createdAt: 2025-04-08T00:00:00.000Z
 *         updatedAt: 2025-04-08T00:00:00.000Z
 */

// This file is just for Swagger documentation
// The actual model is defined in prisma/schema.prisma