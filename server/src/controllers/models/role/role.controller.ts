import { Request, Response } from 'express';
import { prisma } from '../../..';


export const getRoles = async (_: Request, res: Response): Promise<void> => {
  try {
    const roles = await prisma.role.findMany()
    res.json(roles)

  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve roles' })
  }
}

export const getRoleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id)
    const role = await prisma.role.findUnique({
      where: { id },
    })
    
    if (!role) {
      res.status(404).json({ error: 'Role not found' })
      return
    }
    
    res.json(role)

  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve role' })
  }
}