import { PrismaClient, User } from '@prisma/client'
import { Request, Response, NextFunction } from 'express'
import { session } from 'passport';

const prisma = new PrismaClient();


export const requirePermission = (minimum_level: number) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const session_user_id = (req.session as any).passport.user

    const session_user = await prisma.user.findUnique({ where: { id: session_user_id}})

    const role = await prisma.role.findUnique({
      where: { id: (session_user as any).roleId }
    })

    if (!role) {
      res.status(500).send({ msg: 'Role not found' })
      return
    }

    console.log("SESSION USER PERM LEVEL:", role.permissionLevel)

    if (role.permissionLevel < minimum_level) {
      res.status(403).send({ msg: 'Insufficient permission' })
      return
    }

    next()
  }
}