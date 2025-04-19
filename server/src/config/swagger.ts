import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Labchat backend API',
      version,
      description: 'API documentation for the Labchat application using Express TypeScript with Prisma. Made by the binary bandits, a group of graduating computer science students from the University of Auckland.',
    },
    servers: [
      {
        url: '/api',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/**/*.ts', './src/models/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);