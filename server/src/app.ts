import { Application, Request, Response, NextFunction } from 'express';

import './middleware/local_strategy.middleware'
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

const ENV = process.env.NODE_ENV;

// ===== CORS CONFIGURATION =====
import type { CorsOptions } from 'cors';

const corsOptions: CorsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true
};

// Add production-specific CORS options
if (ENV === 'production') {
  corsOptions.methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
  corsOptions.allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'];
  corsOptions.exposedHeaders = ['Set-Cookie']; // This helps with cookie handling
}

app.use(cors(corsOptions));

// ===== SESSION CONFIGURATION =====
const sessionOptions = {
  secret: process.env.SESSION_SECRET!,
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 60000 * 60 * 24 /* 1day */,
    httpOnly: ENV === 'production' ? true : undefined,
    secure: ENV === 'production' ? false : undefined,
    sameSite: ENV === 'production' ? 'lax' as 'lax' : undefined,
    domain: ENV === 'production' ? process.env.DOMAIN : undefined
  },
  store: new PrismaSessionStore(
    new PrismaClient(),
    {
      checkPeriod: 2 * 60 * 1000, /* 2 minutes */
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined
    }
  )
};

app.use(session(sessionOptions));

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