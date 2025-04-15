import { Router } from 'express';

import { getAuth, isAuth, clearAuth } from '../controllers/auth/auth.controller';

import { requirePermission } from '../middleware/permission.middleware';
import passport from '../middleware/local_strategy.middleware';


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */
const router = Router();


// /api/auth/
router.get('/status', isAuth);

router.get('/logout', clearAuth);

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err: { message: any; }, user: Express.User, info: any) => {
      if (err) {
        console.error('Auth error:', err.message || err)
        return res.status(401).json({ error: err.message || 'Authentication failed' })
      }
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' })
      }
  
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Login failed' });
        }
  
        return res.status(200).json({ message: 'Login successful', user })
      })
    })(req, res, next)
  })

// router.get('/protected', passport.authenticate('local'), requirePermission(80), protectedPoint);

export default router;