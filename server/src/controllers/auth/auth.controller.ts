import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { emitWarning } from 'process';

const prisma = new PrismaClient();

// export const getAuth = async (req: Request, res: Response): Promise<void> => {
//   console.log(req.session)
//   console.log(req.session.id);

//   (req.session as any).visited = true

//   res.cookie('hello', 'world', {
//     maxAge: 60000,
//     signed: true
//   })
//   res.status(201).send({ msg: 'Hello world'})
// };

export const getAuth = async (req: Request, res: Response): Promise<void> => {
  const {
    body: { loginEmail, loginPassword }
  } = req

  const user = await prisma.user.findUnique({
    where: { loginEmail },
  })

  if (!user) {
    res.status(401).send({ msg: 'User not found' })
    return
  }

  if (user.loginPassword !== loginPassword) {
    res.status(401).send({ msg: 'Invalid credentials' })
    return
  }

  // Create and map user to this session cookie object

  // Don't put entire user object in, will change to relevant attributes
  (req.session as any).user = user
  console.log(user)

  res.status(200).send(user)
}

export const isAuth = async (req: Request, res: Response): Promise<void> => {
  req.sessionStore.get(req.session.id, (err, session) => {
    console.log(session)
  })

  const session_user = (req.session as any).user
  if ( session_user ) {
    res.status(200).send(session_user)
    return
  }
  res.status(401).send({ msg: 'No session stored' })
  return
}
