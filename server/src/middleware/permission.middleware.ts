import { PrismaClient, User } from '@prisma/client'
import { Request, Response, NextFunction } from 'express'

const prisma = new PrismaClient();


export const requirePermission = (minimum_level: number) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const session_user: User = (req.session as any).user

    const role = await prisma.role.findUnique({
      where: { id: session_user.roleId }
    })

    if (!role) {
      res.status(500).send({ msg: 'Role not found' })
      return
    }

    if (role.permissionLevel < minimum_level) {
      res.status(403).send({ msg: 'Insufficient permission' })
      return
    }

    next()
  }
}