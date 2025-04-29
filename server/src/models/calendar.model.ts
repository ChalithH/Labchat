/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - id
 *         - labId
 *         - memberId
 *         - title
 *         - startTime
 *         - endTime
 *         - updatedAt
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         labId:
 *           type: integer
 *           example: 1
 *         memberId:
 *           type: integer
 *           example: 1
 *         instrumentId:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         title:
 *           type: string
 *           example: "HPLC Analysis Session"
 *         description:
 *           type: string
 *           nullable: true
 *           example: "Analysis of protein samples using HPLC System #1"
 *         status:
 *           type: string
 *           nullable: true
 *           example: "scheduled"
 *         startTime:
 *           type: string
 *           format: date-time
 *           example: "2025-04-15T09:00:00.000Z"
 *         endTime:
 *           type: string
 *           format: date-time
 *           example: "2025-04-15T12:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-04-22T02:28:26.697Z"
 *         type:
 *           type: string
 *           nullable: true
 *           example: "instrument_booking"
 *         lab:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             name:
 *               type: string
 *               example: "Molecular Chemistry Lab"
 *         assigner:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             name:
 *               type: string
 *               example: "Dr. Smith"
 *         instrument:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             name:
 *               type: string
 *               example: "HPLC System #1"
 *         eventAssignments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: "Dr. Chen"
 */
