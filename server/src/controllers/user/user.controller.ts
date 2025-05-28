import { Request, Response } from 'express';
import { User } from '@prisma/client';
import { hashPassword } from '../../utils/hashing.util';
import { prisma } from '../..';

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: >
 *       Registers a new user in the system. 
 *       Checks for existing email and username to prevent duplicates.
 *       Automatically creates a default LabMember entry for the new user (e.g., in a general lab).
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput' 
 *     responses:
 *       201:
 *         description: User created successfully. Returns the created user object (excluding password).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       409:
 *         description: Conflict - Email or username already exists.
 *       500:
 *         description: Internal server error during user creation.
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
    });

    // TODO: The labId and labRoleId are hardcoded to 1, change later?
   
    await prisma.labMember.create({
      data: {
        userId: newUser.id,
        labId: 1,       
        labRoleId: 1 
      }
    });

    res.status(201).json(newUser);

  } catch (error) {
    
    console.error('Error creating user:', error);
   
    res.status(500).json({ error: 'Failed to create user due to an internal error' });
  }
}

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of all users
 *     description: Fetches all registered users. Sensitive information like passwords should be excluded.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User' # Ensure this schema definition excludes sensitive fields
 *       500:
 *         description: Internal server error.
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
  * /users/{id}:
  *   get:
  *     summary: Get a specific user by their ID
  *     description: Retrieve detailed information for a single user. Excludes sensitive data.
  *     tags: [Users]
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: integer
  *         description: The unique identifier of the user.
  *     responses:
  *       200:
  *         description: User details retrieved successfully.
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/User' # Ensure this schema definition excludes sensitive fields
  *       404:
  *         description: User not found with the specified ID.
  *       500:
  *         description: Internal server error.
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
 * /users/{id}:
 *   put:
 *     summary: Update an existing user
 *     description: Modifies details for a specified user. Password updates should be handled separately or with care.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateInput' # Define a schema for updatable fields
 *     responses:
 *       200:
 *         description: User updated successfully. Returns the updated user object (excluding password).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid user ID or request body.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { loginPassword, ...userDataToUpdate } = req.body; 

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid user ID format" });
      return;
    }
    
    // todo:
    // Ensure robust validation for password changes (e.g., current password confirmation if applicable).

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { ...userDataToUpdate }, 
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

    // `findMany` returns an empty array if no records are found, not null.
    // So, no specific check for `!contacts` is needed to return an empty list.
    res.status(200).json(contacts); // Will correctly send [] if no contacts exist.

  } catch (error) {
    console.error(`Failed to retrieve contacts for user ID ${req.params.userId}:`, error);
    res.status(500).json({ error: 'Failed to retrieve user contacts' });
  }
};