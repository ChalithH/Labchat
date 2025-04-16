import { Application, Request, Response, NextFunction } from 'express';
import { swaggerDocs } from './middleware/swaggerDocs.middleware';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '@prisma/client';

import './middleware/local_strategy.middleware'

import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';

import routes from './routes';


const cors = require('cors');
const express = require('express');

const app: Application = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser(process.env.COOKIE_SECRET))

// Express Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 60000 * 60 * 24 /* 1day */
    },
    store: new PrismaSessionStore(
      new PrismaClient(), {
        checkPeriod: 2 * 60 * 1000, /* 2seconds */
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined
      }
    )
  })
)

// Initialise passportjs
app.use(passport.initialize())
app.use(passport.session())

// CORS for front end server
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Basic error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Swagger documentation
swaggerDocs(app);

// Finally, register routes
app.use('/api', routes);


export default app;