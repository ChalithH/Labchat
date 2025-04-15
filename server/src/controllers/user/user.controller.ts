import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../utils/hashing.util';

const prisma = new PrismaClient();


export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, ...user_data  } = req.body

    if (user_data.loginEmail && await prisma.user.findUnique({ where: { loginEmail: user_data.loginEmail } })) {
      res.status(409).json({ error: 'Email already registered' })
      return
    }

    const hashed_password = await hashPassword(user_data.loginPassword)

    const user = await prisma.user.create({ data: { ...user_data, loginPassword: hashed_password } })
    
    res.status(201).json(user)
    return

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create user' })
    return
  }
}

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
};

/**
  * @swagger
  * /users/{id}:
  *   get:
  *     summary: Get a user by ID
  *     tags: [Users]
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: integer
  *         description: User ID
  *     responses:
  *       200:
  *         description: A user object
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/User'
  *       404:
  *         description: User not found
  *       500:
  *         description: Server error
  */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
};
