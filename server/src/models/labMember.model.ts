/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - username
 *         - loginEmail
 *         - firstName
 *         - lastName
 *       properties:
 *         id:
 *           type: integer
 *         roleId:
 *           type: integer
 *         universityId:
 *           type: string
 *         username:
 *           type: string
 *         loginEmail:
 *           type: string
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
 *         dateJoined:
 *           type: string
 *           format: date-time
 *         lastViewed:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     LabMember:
 *       type: object
 *       required:
 *         - id
 *         - userId
 *         - labId
 *         - labRoleId
 *         - inductionDone
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: integer
 *         labId:
 *           type: integer
 *         labRoleId:
 *           type: integer
 *         inductionDone:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         user:
 *           $ref: '#/components/schemas/User'
 *       example:
 *         id: 1
 *         userId: 2
 *         labId: 1
 *         labRoleId: 1
 *         inductionDone: true
 *         createdAt: "2025-05-05T07:11:50.944Z"
 *         updatedAt: "2025-05-05T07:11:50.944Z"
 *         user:
 *           id: 2
 *           roleId: 2
 *           universityId: "PI10042"
 *           username: "dr_smith"
 *           loginEmail: "smith@labchat.com"
 *           firstName: "Jennifer"
 *           lastName: "Smith"
 *           displayName: "Dr. Smith"
 *           jobTitle: "Principal Investigator"
 *           office: "Science Building 2.05"
 *           bio: "Leading research in molecular chemistry"
 *           dateJoined: "2025-05-05T07:11:50.877Z"
 *           lastViewed: null
 */
