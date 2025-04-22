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
 *         labId:
 *           type: integer
 *         memberId:
 *           type: integer
 *         instrumentId:
 *           type: integer
 *           nullable: true
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         status:
 *           type: string
 *           nullable: true
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         type:
 *           type: string
 *           nullable: true
 *         lab:
 *           $ref: '#/components/schemas/Lab'
 *         assigner:
 *           $ref: '#/components/schemas/LabMember'
 *         instrument:
 *           $ref: '#/components/schemas/Instrument'
 *         eventAssignments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EventAssignment'

 *     EventAssignment:
 *       type: object
 *       required:
 *         - id
 *         - memberId
 *         - eventId
 *       properties:
 *         id:
 *           type: integer
 *         memberId:
 *           type: integer
 *         eventId:
 *           type: integer
 *         member:
 *           $ref: '#/components/schemas/LabMember'
 *         event:
 *           $ref: '#/components/schemas/Event'
 */
