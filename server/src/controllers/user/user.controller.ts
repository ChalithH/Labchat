import { Request, Response } from 'express';
import { User } from '@prisma/client';
import { hashPassword } from '../../utils/hashing.util';
import { prisma } from '../..';

/**
 * @swagger
 * /user/:
 *   post:
 *     summary: Create a new user
 *     description: Register a new user with hashed password and automatically add them as a member to the default lab.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *               - universityId
 *               - username
 *               - loginEmail
 *               - loginPassword
 *               - firstName
 *               - lastName
 *               - displayName
 *             properties:
 *               roleId:
 *                 type: integer
 *                 description: ID of the user\'s system role
 *                 example: 2
 *               universityId:
 *                 type: string
 *                 maxLength: 16
 *                 description: University ID of the user
 *                 example: "12345678"
 *               username:
 *                 type: string
 *                 description: Unique username
 *                 example: "johndoe"
 *               loginEmail:
 *                 type: string
 *                 format: email
 *                 description: User\'s login email address
 *                 example: "john.doe@university.edu"
 *               loginPassword:
 *                 type: string
 *                 description: User\'s plain text password (will be hashed)
 *                 example: "SecurePassword123!"
 *               firstName:
 *                 type: string
 *                 description: User\'s first name
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: User\'s last name
 *                 example: "Doe"
 *               displayName:
 *                 type: string
 *                 description: User\'s display name
 *                 example: "John Doe"
 *               jobTitle:
 *                 type: string
 *                 nullable: true
 *                 description: User\'s job title
 *                 example: "Research Assistant"
 *               office:
 *                 type: string
 *                 nullable: true
 *                 description: User\'s office location
 *                 example: "Room 205"
 *               bio:
 *                 type: string
 *                 nullable: true
 *                 description: User\'s biography
 *                 example: "Passionate researcher in molecular biology"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 10
 *                 roleId:
 *                   type: integer
 *                   example: 2
 *                 universityId:
 *                   type: string
 *                   example: "12345678"
 *                 username:
 *                   type: string
 *                   example: "johndoe"
 *                 loginEmail:
 *                   type: string
 *                   example: "john.doe@university.edu"
 *                 firstName:
 *                   type: string
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   example: "Doe"
 *                 displayName:
 *                   type: string
 *                   example: "John Doe"
 *                 jobTitle:
 *                   type: string
 *                   example: "Research Assistant"
 *                 office:
 *                   type: string
 *                   example: "Room 205"
 *                 bio:
 *                   type: string
 *                   example: "Passionate researcher in molecular biology"
 *                 dateJoined:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-05-26T12:00:00.000Z"
 *                 lastViewed:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 lastViewedLabId:
 *                   type: integer
 *                   nullable: true
 *                   example: null
 *       409:
 *         description: Conflict - Email or username already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email already registered"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to create user"
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData = req.body;

    // Check for email conflict
    if (userData.loginEmail && await prisma.user.findUnique({ where: { loginEmail: userData.loginEmail } })){
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    
    if (userData.username && await prisma.user.findUnique({ where: { username: userData.username } })){
      res.status(409).json({ error: 'Username already exists' });
      return;
    }

    const hashedPassword = await hashPassword(userData.loginPassword);
    const { id, loginPassword, ...dataToCreate } = userData; // Exclude id (auto-generated) and original password

   

    const newUser = await prisma.user.create({
      data: {
        ...dataToCreate,
        loginPassword: hashedPassword, 
      },
      
      select: {
        id: true,
        roleId: true,
        universityId: true,
        username: true,
        loginEmail: true,
        firstName: true,
        lastName: true,
        displayName: true,
        jobTitle: true,
        office: true,
        bio: true,
        dateJoined: true,
        lastViewed: true,
        lastViewedLabId: true,
        // Do not include 'loginPassword'
      }
    })
    
    /*
    Removed since we are no longer automatically adding users to the default lab.
    await prisma.labMember.create({
      data: {
        userId: newUser.id,
        labId: 1,       
        labRoleId: 1 
      }
    }); */

    res.status(201).json(newUser);

  } catch (error) {
    
    console.error('Error creating user:', error);
   
    res.status(500).json({ error: 'Failed to create user due to an internal error' });
  }
}

/**
 * @swagger
 * /user/get:
 *   get:
 *     summary: Retrieve a list of all users
 *     description: Get all users in the system. Note - this may need pagination for large datasets.
 *     tags: [User]
 *     responses:
 *       200:
 *         description: A list of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   roleId:
 *                     type: integer
 *                     example: 2
 *                   universityId:
 *                     type: string
 *                     example: "12345678"
 *                   username:
 *                     type: string
 *                     example: "johndoe"
 *                   loginEmail:
 *                     type: string
 *                     example: "john.doe@university.edu"
 *                   firstName:
 *                     type: string
 *                     example: "John"
 *                   lastName:
 *                     type: string
 *                     example: "Doe"
 *                   displayName:
 *                     type: string
 *                     example: "John Doe"
 *                   jobTitle:
 *                     type: string
 *                     nullable: true
 *                     example: "Research Assistant"
 *                   office:
 *                     type: string
 *                     nullable: true
 *                     example: "Room 205"
 *                   bio:
 *                     type: string
 *                     nullable: true
 *                     example: "Passionate researcher in molecular biology"
 *                   dateJoined:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-05-26T12:00:00.000Z"
 *                   lastViewed:
 *                     type: string
 *                     nullable: true
 *                     example: "/lab/1"
 *                   lastViewedLabId:
 *                     type: integer
 *                     nullable: true
 *                     example: 1
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve users"
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      
      select: {
        id: true,
        roleId: true,
        universityId: true,
        username: true,
        loginEmail: true,
        firstName: true,
        lastName: true,
        displayName: true,
        jobTitle: true,
        office: true,
        bio: true,
        dateJoined: true,
        lastViewed: true,
        lastViewedLabId: true,
        profilePic: true,
        // Explicitly exclude 'loginPassword'
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
};

/**
 * @swagger
 * /user/get/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieve a specific user by their unique ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique user ID
 *         example: 5
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 5
 *                 roleId:
 *                   type: integer
 *                   example: 2
 *                 universityId:
 *                   type: string
 *                   example: "12345678"
 *                 username:
 *                   type: string
 *                   example: "johndoe"
 *                 loginEmail:
 *                   type: string
 *                   example: "john.doe@university.edu"
 *                 loginPassword:
 *                   type: string
 *                   description: Hashed password
 *                   example: "$2b$10$..."
 *                 firstName:
 *                   type: string
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   example: "Doe"
 *                 displayName:
 *                   type: string
 *                   example: "John Doe"
 *                 jobTitle:
 *                   type: string
 *                   nullable: true
 *                   example: "Research Assistant"
 *                 office:
 *                   type: string
 *                   nullable: true
 *                   example: "Room 205"
 *                 bio:
 *                   type: string
 *                   nullable: true
 *                   example: "Passionate researcher in molecular biology"
 *                 dateJoined:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-05-26T12:00:00.000Z"
 *                 lastViewed:
 *                   type: string
 *                   nullable: true
 *                   example: "/lab/1"
 *                 lastViewedLabId:
 *                   type: integer
 *                   nullable: true
 *                   example: 1
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve user"
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10); 

    if (isNaN(id)) {
        res.status(400).json({ error: "Invalid user ID format" });
        return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
      // Select only non-sensitive fields
      select: {
        id: true,
        roleId: true,
        universityId: true,
        username: true,
        loginEmail: true,
        firstName: true,
        lastName: true,
        displayName: true,
        jobTitle: true,
        office: true,
        bio: true,
        dateJoined: true,
        lastViewed: true,
        lastViewedLabId: true,
        profilePic: true,
      }
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json(user);
  } catch (error) {
    console.error(`Error retrieving user with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to retrieve user information' });
  }
};

/**
 * @swagger
 * /user/update/{id}:
 *   put:
 *     summary: Update a user by ID
 *     description: Update user information. All provided fields will be updated. Note that passwords should be hashed if being updated.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique user ID
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleId:
 *                 type: integer
 *                 description: ID of the user's system role
 *                 example: 3
 *               universityId:
 *                 type: string
 *                 maxLength: 16
 *                 description: University ID of the user
 *                 example: "87654321"
 *               username:
 *                 type: string
 *                 description: Unique username
 *                 example: "johndoe_updated"
 *               loginEmail:
 *                 type: string
 *                 format: email
 *                 description: User's login email address
 *                 example: "john.doe.updated@university.edu"
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *                 example: "Jonathan"
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *                 example: "Doe"
 *               displayName:
 *                 type: string
 *                 description: User's display name
 *                 example: "Jonathan Doe"
 *               jobTitle:
 *                 type: string
 *                 nullable: true
 *                 description: User's job title
 *                 example: "Senior Research Assistant"
 *               office:
 *                 type: string
 *                 nullable: true
 *                 description: User's office location
 *                 example: "Room 301"
 *               bio:
 *                 type: string
 *                 nullable: true
 *                 description: User's biography
 *                 example: "Senior researcher with expertise in molecular biology and genetics"
 *               lastViewed:
 *                 type: string
 *                 nullable: true
 *                 description: Last page/route viewed by user
 *                 example: "/lab/2"
 *               lastViewedLabId:
 *                 type: integer
 *                 nullable: true
 *                 description: ID of the last lab viewed by user
 *                 example: 2
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 5
 *                 roleId:
 *                   type: integer
 *                   example: 3
 *                 universityId:
 *                   type: string
 *                   example: "87654321"
 *                 username:
 *                   type: string
 *                   example: "johndoe_updated"
 *                 loginEmail:
 *                   type: string
 *                   example: "john.doe.updated@university.edu"
 *                 firstName:
 *                   type: string
 *                   example: "Jonathan"
 *                 lastName:
 *                   type: string
 *                   example: "Doe"
 *                 displayName:
 *                   type: string
 *                   example: "Jonathan Doe"
 *                 jobTitle:
 *                   type: string
 *                   example: "Senior Research Assistant"
 *                 office:
 *                   type: string
 *                   example: "Room 301"
 *                 bio:
 *                   type: string
 *                   example: "Senior researcher with expertise in molecular biology and genetics"
 *                 dateJoined:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-05-26T12:00:00.000Z"
 *                 lastViewed:
 *                   type: string
 *                   example: "/lab/2"
 *                 lastViewedLabId:
 *                   type: integer
 *                   example: 2
 *       400:
 *         description: Bad request - Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid user ID"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to update user"
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const userDataToUpdate = req.body; 

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid user ID format" });
      return;
    }
    
    // todo:
    // Ensure robust validation for password changes (e.g., current password confirmation if applicable).

    const updatedUser = await prisma.user.update({
      where: { id },
      data: userDataToUpdate,
      // Select to exclude password from being returned
      select: {
        id: true,
        roleId: true,
        universityId: true,
        username: true,
        loginEmail: true,
        firstName: true,
        lastName: true,
        displayName: true,
        jobTitle: true,
        office: true,
        bio: true,
        dateJoined: true,
        lastViewed: true,
        lastViewedLabId: true,
      }
    });
    res.json(updatedUser);
  } catch (error) {
    // Catch Prisma P2025 error if user not found for update
    if ((error as any).code === 'P2025') {
      res.status(404).json({ error: 'User not found for update' });
      return;
    }
    console.error(`Error updating user with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

/**
 * @swagger
 * /users/{userId}/contacts:
 *   get:
 *     summary: Get all contacts for a specific user
 *     description: Retrieves a list of all contact methods associated with a given user ID.
 *     tags: [Users, Contacts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user whose contacts are to be fetched.
 *     responses:
 *       200:
 *         description: A list of the user's contacts. Returns an empty array if the user has no contacts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact' 
 *       400:
 *         description: Invalid user ID format.
 *       404:
 *         description: User not found (if checking for user existence before fetching contacts).
 *       500:
 *         description: Internal server error.
 */
export const getUserContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID format" });
      return;
    }

    // TODO: Authorization Check:
    // - An admin should be able to fetch any user's contacts.
    // - A regular user should only be able to fetch their own contacts.
    // This requires knowing the authenticated user's ID and role.
    // Example: if (authenticatedUserId !== userId && !isAdmin) { return res.status(403).json(...); }

    // Optional: Check if the user exists before trying to fetch contacts.
    // const user = await prisma.user.findUnique({ where: { id: userId } });
    // if (!user) {
    //   res.status(404).json({ error: "User not found" });
    //   return;
    // }

    const contacts = await prisma.contact.findMany({
      where: { userId: userId },
      select: {
        id: true,
        type: true,
        info: true,
        useCase: true,
        name: true,
      },
    });

    res.status(200).json(contacts); 

  } catch (error) {
    console.error(`Failed to retrieve contacts for user ID ${req.params.userId}:`, error);
    res.status(500).json({ error: 'Failed to retrieve user contacts' });
  }
};

/**
 * @swagger
 * /user/switch-lab/{id}:
 *   put:
 *     summary: Switch user to a different lab
 *     description: Allow a user to switch to a lab they are already a member of. Updates the user's lastViewedLabId and lastViewed fields.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user switching labs
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - labId
 *             properties:
 *               labId:
 *                 type: integer
 *                 description: ID of the lab to switch to
 *                 example: 3
 *     responses:
 *       200:
 *         description: Successfully switched to the lab
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully switched to lab"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 5
 *                     lastViewedLabId:
 *                       type: integer
 *                       example: 3
 *                     lastViewed:
 *                       type: string
 *                       example: "/lab/3"
 *                 lab:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 3
 *                     name:
 *                       type: string
 *                       example: "Chemistry Research Lab"
 *                     location:
 *                       type: string
 *                       example: "Building B, Room 105"
 *                 membership:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 15
 *                     labRoleId:
 *                       type: integer
 *                       example: 2
 *                     inductionDone:
 *                       type: boolean
 *                       example: true
 *                     labRole:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Research Assistant"
 *       400:
 *         description: Bad request - missing labId or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "labId is required"
 *       403:
 *         description: Forbidden - user is not a member of the specified lab
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "You are not a member of this lab"
 *       404:
 *         description: User or lab not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to switch lab"
 */
export const switchUserLab = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { labId } = req.body;

    console.log(id)

    if (!id || isNaN(Number(id))) {
      console.log("Invalid userId:", id);
      res.status(400).json({ error: 'Valid userId is required' });
      return;
    }

    if (!labId || isNaN(Number(labId))) {
      res.status(400).json({ error: 'Valid labId is required' });
      return;
    }

    const userIdNum = Number(id);
    const labIdNum = Number(labId);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userIdNum },
        select: {
          id: true,
          lastViewedLabId: true,
          lastViewed: true
        }
      });

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      // Check if lab exists
      const lab = await tx.lab.findUnique({
        where: { id: labIdNum },
        select: {
          id: true,
          name: true,
          location: true,
          status: true
        }
      });

      if (!lab) {
        throw new Error('LAB_NOT_FOUND');
      }

      const membership = await tx.labMember.findFirst({
        where: {
          userId: userIdNum,
          labId: labIdNum
        },
        include: {
          labRole: {
            select: {
              id: true,
              name: true,
              description: true,
              permissionLevel: true
            }
          }
        }
      });

      if (!membership) {
        throw new Error('NOT_MEMBER');
      }

      const updatedUser = await tx.user.update({
        where: { id: userIdNum },
        data: {
          lastViewedLabId: labIdNum,
        },
        select: {
          id: true,
          lastViewedLabId: true
        }
      });
      

      return {
        labId: updatedUser.lastViewedLabId,
      };
    });

    // Return success response
    res.status(200).json({
      message: 'Successfully switched to lab',
      ...result
    });

  } catch (error) {
    console.error("Error switching user lab:", error);
    
    // Handle specific transaction errors
    if (error instanceof Error) {
      switch (error.message) {
        case 'USER_NOT_FOUND':
          res.status(404).json({ error: 'User not found' });
          return;
        case 'LAB_NOT_FOUND':
          res.status(404).json({ error: 'Lab not found' });
          return;
        case 'NOT_MEMBER':
          res.status(403).json({ error: 'You are not a member of this lab' });
          return;
      }
    }
    
    res.status(500).json({ error: 'Failed to switch lab' });
  }
};

/**
 * @swagger
 * /user/available-labs/{id}:
 *   get:
 *     summary: Get labs available for user to switch to
 *     description: Retrieve all labs where the user is currently a member, useful for lab switching dropdown/interface.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user
 *         example: 5
 *     responses:
 *       200:
 *         description: List of available labs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   labId:
 *                     type: integer
 *                     example: 1
 *                   lab:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Molecular Biology Lab"
 *                       location:
 *                         type: string
 *                         example: "Building A, Room 203"
 *                       status:
 *                         type: string
 *                         example: "Active"
 *                   role:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Research Assistant"
 *                       permissionLevel:
 *                         type: integer
 *                         example: 3
 *                   inductionDone:
 *                     type: boolean
 *                     example: true
 *                   isCurrentLab:
 *                     type: boolean
 *                     description: Whether this is the user's currently selected lab
 *                     example: false
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const getUserAvailableLabs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate userId
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: 'Valid userId is required' });
      return;
    }

    const userIdNum = Number(id);

    // Check if user exists and get current lab
    const user = await prisma.user.findUnique({
      where: { id: userIdNum },
      select: {
        id: true,
        lastViewedLabId: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get all labs where user is a member
    const memberships = await prisma.labMember.findMany({
      where: { 
        userId: userIdNum,
        labRole: { permissionLevel: { gte: 0 } } // Only active memberships (not 'Former Members')
      },
      include: {
        lab: {
          select: {
            id: true,
            name: true,
            location: true,
            status: true
          }
        },
        labRole: {
          select: {
            id: true,
            name: true,
            description: true,
            permissionLevel: true
          }
        }
      },
      orderBy: {
        lab: {
          name: 'asc'
        }
      }
    });

    // Format the response
    const availableLabs = memberships.map(membership => ({
      labId: membership.labId,
      membershipId: membership.id,
      lab: membership.lab,
      role: membership.labRole,
      inductionDone: membership.inductionDone,
      joinedAt: membership.createdAt,
      isCurrentLab: membership.labId === user.lastViewedLabId
    }));

    res.status(200).json(availableLabs);

  } catch (error) {
    console.error("Error retrieving user available labs:", error);
    res.status(500).json({ error: 'Failed to retrieve available labs' });
  }
};