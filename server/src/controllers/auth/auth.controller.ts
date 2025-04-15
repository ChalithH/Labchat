import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


/* Requires loginEmail and loginPassword to attempt to sign the current session
   to a user stored in the database. */
export const getAuth = async (req: Request, res: Response): Promise<void> => {
  res.status(200).send({ msg: 'Ya entad'})

  // Handled by passport middleware 
  // const {
  //   body: { loginEmail, loginPassword }
  // } = req;

  // const user = await prisma.user.findUnique({
  //   where: { loginEmail },
  // })

  // if (!user) {
  //   res.status(401).send({ msg: 'User not found' })
  //   return
  // }

  // if (user.loginPassword !== loginPassword) {
  //   res.status(401).send({ msg: 'Invalid credentials' })
  //   return
  // }

  // Create and map user to this session cookie object

  // Don't put entire user object in, will change to relevant attributes
  // (req.session as any).user = user
  // res.status(200).send(user)
}

// If session has stored auth, clear it
export const clearAuth = (req: Request, res: Response): void => {
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

  // const session_user = (req.session as any).user
  // if ( !session_user ) {
  //   res.status(401).send({ msg: 'No session stored' })
  //   return
  // }

  // req.session.destroy((err) => {
  //   if (err) {
  //     res.status(500).send({ msg: 'Failed to log out' })
  //     return
  //   }
  //   res.clearCookie('connect.sid')
  //   res.status(200).send({ msg: 'Logged out successfully' })
  // })
  // return
}

// Will return user object stored in the database that associates to user in session
export const isAuth = async (req: Request, res: Response): Promise<void> => {
  if (req.user) {
    res.status(200).send(req.user)
    console.log(req.session)
    return
  }

  res.status(401).send({ msg: 'Cannot find a user session' })
  return
  
  // req.sessionStore.get(req.session.id, (err, session) => {
  //   session && console.log(session)
  // })

  // const session_user = (req.session as any).user
  // if ( session_user ) {
  //   res.status(200).send(session_user)
  //   return
  // }
  // res.status(401).send({ msg: 'No session stored' })
  // return
}

export const protectedPoint = (req: Request, res: Response): void => {
  res.status(200).send({ msg: 'Message' })
  return
}