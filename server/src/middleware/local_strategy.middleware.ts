import { PrismaClient, User } from '@prisma/client'

import { comparePasswords } from '../utils/hashing.util'

import { Strategy as LocalStrategy } from 'passport-local'
import passport from 'passport'


const prisma = new PrismaClient()

passport.serializeUser( (user, done) => {
  done(null, (user as User).id )
})

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      throw new Error('User not found')
    }

    done(null, user.id)

  } catch (err) {
    done(err, null)
  }
})

export default passport.use(
  new LocalStrategy({ usernameField: 'loginEmail', passwordField: 'loginPassword' }, async (loginEmail: string, loginPassword: string, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { loginEmail: loginEmail }
      })
      
      if (!user)
        throw new Error('User not found')
      
      if (!(await comparePasswords(loginPassword, user.loginPassword))) {
        throw new Error('Invalid credentials')
      }
      
      done(undefined, user.id)

    } catch (err) {
      done(err, undefined)
    }
  })
)