/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       required:
 *         - id
 *         - userId
 *         - type
 *         - name
 *         - info
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the contact
 *         userId:
 *           type: integer
 *           description: The ID of the user associated with the contact
 *         type:
 *           type: string
 *           description: The type of the contact (e.g., email, phone)
 *         name:
 *           type: string
 *           description: The name associated with the contact
 *         useCase:
 *           type: string
 *           description: A brief description of the contact's use case
 *         info:
 *           type: string
 *           description: The contact's detailed information (e.g., email address, phone number)
 *       example:
 *         id: 1
 *         userId: 10
 *         type: email
 *         name: John Doe
 *         useCase: Personal Contact
 *         info: johndoe@example.com
 */