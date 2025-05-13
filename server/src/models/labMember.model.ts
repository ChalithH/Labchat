/**
 * @swagger
 * components:
 *   schemas:
 *     LabMember:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         displayName:
 *           type: string
 *         jobTitle:
 *           type: string
 *         office:
 *           type: string
 *           nullable: true
 *         bio:
 *           type: string
 *         memberID:
 *           type: integer
 *         labID:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         inductionDone:
 *           type: boolean
 *         status:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               contactType:
 *                 type: string
 *               contactInfo:
 *                 type: string
 *               contactName:
 *                 type: string
 */
