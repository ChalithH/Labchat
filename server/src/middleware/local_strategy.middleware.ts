import { Strategy } from 'passport-local'
import { PrismaClient, User } from '@prisma/client';

import passport from 'passport'
import { comparePasswords } from '../utils/hashing.util';


const prisma = new PrismaClient();

passport.serializeUser( (user, done) => {
  console.log('Serialise:', user)
  done(null, (user as User).id )
})

passport.deserializeUser(async (id: number, done) => {
  console.log('Deserialise:', id)

  try {
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      throw new Error('User not found')
    }

    done(null, user)

  } catch (err) {
    done(err, null)
  }
})

export default passport.use(
  new Strategy({ usernameField: 'loginEmail', passwordField: 'loginPassword' }, async (loginEmail: string, loginPassword: string, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { loginEmail: loginEmail }
      })
      

      if (!user)
        throw new Error('User not found')
      
      if (!(await comparePasswords(loginPassword, user.loginPassword))) {
        throw new Error('Invalid credentials')
      }

      done(undefined, user)

    } catch (err) {
      done(err, undefined)
    }
  })
)