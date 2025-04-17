import { NextFunction, Request, Response } from 'express';
import { PrismaClient, User } from '@prisma/client';
import passport from 'passport';

import '../../middleware/local_strategy.middleware'
import { prisma } from '../..';


/*    LOGIN
 *
 *    Function will use the local_strategy middleware for passport.js to authenticate the session
 *    with a valid user in the database.
 * 
 *    Expected fields
 *      loginEmail    : email of user attempting to login as, must match a user in the database
 *      loginPassword : password of user attempting to login as, must match a user in the database
 * 
 *    Responses
 *      200 : Login successful, user session created
 *      400 : User not found in database
 *      401 : Some error with authenticating with a valid user
 *      500 : Internal error while logging in to user
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  // Invoke the local_strategy middleware verifying a user object exists
  passport.authenticate('local', async (err: { message: any; }, id: number) => {

    /* If execution reaches this point we have already verified that our response
       email and password match some user stored in the database. */
       
    if (err) {
      console.error('Authentication error -', err.message || err)
      res.status(401).json({ error: err.message || 'Authentication failed' })
      return
    }

    // Grab the user from the provided ID
    const user: User | null = await prisma.user.findUnique({ where: { id }})
    
    if (!user) 
      return res.status(500).json({ error: 'User not found' });

    // Attempt to create the user session
    req.logIn(user, (err) => {
      if (err) {
        res.status(500).json({ error: 'Login failed' });
        return
      }

      res.status(200).json({ message: 'Login successful', id })
      return
    })
  }) (req, res, next)
}



/*    LOGOUT
 *
 *    Function will destroy the current session if it exists.
 * 
 *    Responses
 *      200 : Log out successful, user session destroyed
 *      400 : No current session to destroy
 *      500 : Internal error while destroying session 
 */
export const logout = (req: Request, res: Response): void => {
  
  /* The local_strategy middleware will attach a user session to the request
     body, if it exists we know the user is logged in. */
  
  if (!req.user) {
    res.status(400).send({ msg: 'Cannot find a user session' })
    return 
  }

  // Attempt destroy the user session
  req.logout( (err) => {
    if (err) {
      res.status(500).send({ error: 'Failed to log out' })
      return
    }
    
    res.status(200).send({ msg: 'Successfully logged out' })
    return
  })
}



/*    STATUS
 *
 *    If a session is created the function will return the user ID of the user that
 *    the session is linked to
 * 
 *    Responses
 *      200 : Successfully found session and sent the user ID in request
 *      401 : No current session
 */

// TODO
// Send a DTO of the user

export const status = async (req: Request, res: Response): Promise<void> => {

  // If user session is created
  if (req.user) {
    res.status(200).send(req.user)
    return
  }

  res.status(401).send({ msg: 'Cannot find a user session' })
  return
}



/*    LOCKED
 *
 *    Dummy function to demonstrate the requirePermission middleware
 *    No logic here, view the route and permission middleware functions
 * 
 *    Responses
 *      200 : Successful request
 */
export const locked = (req: Request, res: Response): void => {
  res.status(200).send({ msg: 'A very secret message' })
  return
}