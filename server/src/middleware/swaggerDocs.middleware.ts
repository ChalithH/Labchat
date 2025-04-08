import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './../config/swagger';

export const swaggerDocs = (app: Application) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};