import { Application, Request, Response, NextFunction } from 'express';

import { swaggerDocs } from './middleware/swaggerDocs.middleware';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '@prisma/client';

import './middleware/local_strategy.middleware'

=======
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { PrismaClient } from '@prisma/client';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { swaggerDocs } from './middleware/swaggerDocs.middleware';
import routes from './routes';
import { setupLogger } from './middleware/morgan.middleware';

const app: Application = express();

// ===== LOGGER =====
setupLogger(app);

// ===== BASIC MIDDLEWARE =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// ===== CORS CONFIGURATION =====
app.use(cors({ 
  origin: 'http://localhost:3000', 
  credentials: true 
}));

// ===== SESSION CONFIGURATION =====
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 60000 * 60 * 24 /* 1day */
    },
    store: new PrismaSessionStore(
      new PrismaClient(), 
      {
        checkPeriod: 2 * 60 * 1000, /* 2 minutes */
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined
      }
    )
  })
);

// ===== AUTHENTICATION =====
app.use(passport.initialize());
app.use(passport.session());

// ===== API DOCUMENTATION =====
swaggerDocs(app);

// ===== ROUTES =====
app.use('/api', routes);

// ===== ERROR HANDLING =====
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;