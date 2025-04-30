import morgan from 'morgan';
import { Application } from 'express';
import chalk from 'chalk';

/**
 * Sets up the logging middleware for the application.
 * In development, it uses console logging with colored output.
 * In production, it logs to a file in the 'logs' directory.
 *
 * @param {Application} app - The Express application instance.
 */

const morganMiddleware = morgan(function (tokens, req, res) {

    // Get timestamp and wrap in brackets
    const now = new Date();
    const time = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
      
      const date = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      }).format(now);
      
    const timestamp = `[${time} @ ${date}]`;
    let statusColor;
    const status = parseInt(tokens.status(req, res) || '0');
    
    if (status >= 500) {
        statusColor = chalk.red.bold(status); 
    } else if (status >= 400) {
        statusColor = chalk.yellow.bold(status); 
    } else if (status >= 300) {
        statusColor = chalk.cyan.bold(status); 
    } else if (status >= 200) {
        statusColor = chalk.green.bold(status); 
    } else {
        statusColor = chalk.gray.bold(status); 
    }

    return [
        chalk.gray(timestamp),
        chalk.blue.bold(tokens.method(req, res)),
        statusColor,
        chalk.white(tokens.url(req, res)),
        chalk.yellow(tokens['response-time'](req, res) + ' ms'),
    ].join(' ');
});


export const setupLogger = (app: Application): void => {
    app.use(morganMiddleware);

    
};