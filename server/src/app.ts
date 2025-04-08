import express, { Application, Request, Response, NextFunction } from 'express';
import { swaggerDocs } from './middleware/swaggerDocs.middleware';

import routes from './routes';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
swaggerDocs(app);

// Routes
app.use('/api', routes);

// Basic error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;