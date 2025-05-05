/**
 * @swagger
 * components:
 *   schemas:
 *     Lab:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the lab
 *         name:
 *           type: string
 *           description: The name of the lab
 *         description:
 *           type: string
 *           description: A short description of the lab
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the lab was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the lab was last updated
 *       example:
 *         id: 1
 *         name: Chemistry Research Lab
 *         description: A lab focused on organic chemistry experiments
 *         createdAt: 2025-05-01T10:00:00.000Z
 *         updatedAt: 2025-05-03T15:30:00.000Z
 */

// This file is just for Swagger documentation
// The actual model is defined in prisma/schema.prisma
