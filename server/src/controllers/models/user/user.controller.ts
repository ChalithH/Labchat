import { Request, Response } from 'express';
import { User } from '@prisma/client';
import { hashPassword } from '../../../utils/hashing.util';
import { prisma } from '../../..';


export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_data = req.body;

    if (user_data.loginEmail && await prisma.user.findUnique({ where: { loginEmail: user_data.loginEmail } })){
      res.status(409).json({ error: 'Email already registered' })
      return
    }

    const hashed_password: string = await hashPassword(user_data.loginPassword)
    const { iq, ...data } = user_data;

    delete req.body.iq

    const user: User = await prisma.user.create({
      data: {
        ...data,
        loginPassword: hashed_password 
      }
    })

    res.status(201).json(user)
    return

  } catch (error) {
    const user_data = req.body;

    const found_user: boolean = await prisma.user.findUnique({ where: { username: user_data.username }}) ? true : false
    if (found_user) {
      res.status(409).json({ error: 'Username already exists' })
      return
    }

    console.log(error)
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


export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const user_data = req.body;

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: { ...user_data },
    });
    res.json(user);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to update user' });
  }
};