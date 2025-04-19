import { PrismaClient, User } from '@prisma/client'

import { comparePasswords } from '../utils/hashing.util'

import { Strategy as LocalStrategy } from 'passport-local'
import passport from 'passport'
import { prisma } from '..'



/*  
 *  Stores the user ID in the session. This is called when logging in
 *  was successful. Only the user ID is stored in the session cookie.
 */
passport.serializeUser( (user, done) => {
  done(null, (user as User).id )
})


/*  
 *  Confirms a user exists in the database using the ID stored in the session.
 */
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Pass only user ID back
    done(null, user.id)

  } catch (err) {
    done(err, null)
  }
})


/*
 *  This will configure Passport to use the LocalStrategy for authentication and then
 *  check the database for a user with the provided loginEmail field. It will then verify
 *  the password using a bcrypt comparison. If this all is successful the user ID of the
 *  associated user will be attached to the session object.
 *
 *  Expected fields
 *      loginEmail    : email of user attempting to login as, must match a user in the database
 *      loginPassword : password of user attempting to login as, must match a user in the database
 */
export default passport.use(
  new LocalStrategy({ usernameField: 'loginEmail', passwordField: 'loginPassword' }, async (loginEmail: string, loginPassword: string, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { loginEmail: loginEmail }
      })
      
      if (!user)
        throw new Error('User not found')
      
      // Hashes user input and compares with password stored in database
      if (!(await comparePasswords(loginPassword, user.loginPassword))) {
        throw new Error('Invalid credentials')
      }

      // Pass only user ID back
      done(undefined, user.id)
      return

    } catch (err) {
      done(err, undefined)
    }
  })
)