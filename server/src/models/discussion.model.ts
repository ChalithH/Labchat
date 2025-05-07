/**
 * @swagger
 * components:
 *   schemas:
 *     Discussion:
 *       type: object
 *       required:
 *         - id
 *         - labId
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         labId:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Weekly Team Discussion"
 *         description:
 *           type: string
 *           example: "Planning and updates for ongoing experiments"
 *         posts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DiscussionPost'
 * 
 *     DiscussionPost:
 *       type: object
 *       required:
 *         - id
 *         - discussionId
 *         - memberId
 *         - title
 *         - content
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         discussionId:
 *           type: integer
 *           example: 1
 *         memberId:
 *           type: integer
 *           example: 2
 *         title:
 *           type: string
 *           example: "Lab Protocol Updates"
 *         content:
 *           type: string
 *           example: "Let's update the HPLC procedure with new buffer compositions."
 *         isPinned:
 *           type: boolean
 *           example: false
 *         isAnnounce:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-05-01T09:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-05-01T10:15:00.000Z"
 *         replies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DiscussionReply'
 *         tags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DiscussionPostTag'
 *         reactions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DiscussionReaction'
 * 
 *     DiscussionReply:
 *       type: object
 *       required:
 *         - id
 *         - postId
 *         - memberId
 *         - content
 *         - createdAt
 *       properties:
 *         id:
 *           type: integer
 *           example: 100
 *         postId:
 *           type: integer
 *           example: 10
 *         memberId:
 *           type: integer
 *           example: 3
 *         content:
 *           type: string
 *           example: "Great idea! We should also update the buffer pH range."
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-05-01T09:45:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-05-01T09:50:00.000Z"
 * 
 *     DiscussionPostTag:
 *       type: object
 *       required:
 *         - id
 *         - postId
 *         - tag
 *       properties:
 *         id:
 *           type: integer
 *           example: 200
 *         postId:
 *           type: integer
 *           example: 10
 *         tag:
 *           type: string
 *           example: "protocol"
 * 
 *     DiscussionReaction:
 *       type: object
 *       required:
 *         - id
 *         - postId
 *         - memberId
 *         - reactionType
 *         - createdAt
 *       properties:
 *         id:
 *           type: integer
 *           example: 300
 *         postId:
 *           type: integer
 *           example: 10
 *         memberId:
 *           type: integer
 *           example: 5
 *         reactionType:
 *           type: string
 *           example: "like"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-05-01T10:00:00.000Z"
 */
