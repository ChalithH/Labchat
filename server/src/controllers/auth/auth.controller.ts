import { NextFunction, Request, Response } from 'express';
import { PrismaClient, User } from '@prisma/client';
import passport from 'passport';

import '../../middleware/local_strategy.middleware'

const prisma = new PrismaClient();


// Parameters: { loginEmail, loginPassword }
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  passport.authenticate('local', async (err: { message: any; }, id: number) => {

    /* If execution reaches this point we have already verified that our response
       email and password match some user stored in the database. */
       
    if (err) {
      console.error('Authentication error -', err.message || err)
      return res.status(401).json({ error: err.message || 'Authentication failed' })
    }

    // Grab the user from the provided ID
    const user: User | null = await prisma.user.findUnique({ where: { id }})

    req.logIn(user!, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }

      return res.status(200).json({ message: 'Login successful', id })
    })
  }) (req, res, next)
}


export const logout = (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).send({ msg: 'Cannot find a user session' })
    return 
  }

  req.logout( (err) => {
    if (err) {
      console.error(err)
      res.status(400).send({ error: 'Failed to log out' })
      return
    }
    
    res.status(200).send({ msg: 'Successfully logged out' })
  })
}


export const status = async (req: Request, res: Response): Promise<void> => {
  if (req.user) {
    // console.log(req.session)

    res.status(200).send(req.user)
    return
  }

  res.status(401).send({ msg: 'Cannot find a user session' })
  return
}


export const locked = (req: Request, res: Response): void => {
  res.status(200).send({ msg: 'A very secret message' })
  return
}