import morgan from 'morgan';
import { Application, Request, Response, NextFunction } from 'express';
import chalk from 'chalk';

/**
 * Middleware to capture the request and response bodies
 */
const captureRequestResponseBody = (req: Request, res: Response, next: NextFunction) => {
    // Store request information
    res.locals.requestBody = req.body;
    res.locals.requestQuery = req.query;
    res.locals.requestParams = req.params;
    
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Store response body
    res.locals.body = '';
    
    // Override send method
    res.send = function(body: any) {
        res.locals.body = body;
        return originalSend.call(this, body);
    };
    
    // Override json method
    res.json = function(body: any) {
        // Store the actual object, not stringified version
        res.locals.body = body;
        return originalJson.call(this, body);
    };
    
    next();
};

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

    // Format request information
    let requestInfo = '';
    
    // Add query parameters if present
    const requestQuery = (res as Response).locals.requestQuery;
    if (requestQuery && Object.keys(requestQuery).length > 0) {
        try {
            const formattedQuery = JSON.stringify(requestQuery, null, 2);
            const indentedQuery = formattedQuery.split('\n').map(line => '  ' + line).join('\n');
            requestInfo += chalk.gray('\n  Query Parameters:\n') + chalk.white(indentedQuery);
        } catch {
            requestInfo += chalk.gray('\n  Query Parameters: ') + chalk.white(String(requestQuery));
        }
    }
    
    // Add route parameters if present
    const requestParams = (res as Response).locals.requestParams;
    if (requestParams && Object.keys(requestParams).length > 0) {
        try {
            const formattedParams = JSON.stringify(requestParams, null, 2);
            const indentedParams = formattedParams.split('\n').map(line => '  ' + line).join('\n');
            requestInfo += chalk.gray('\n  Route Parameters:\n') + chalk.white(indentedParams);
        } catch {
            requestInfo += chalk.gray('\n  Route Parameters: ') + chalk.white(String(requestParams));
        }
    }
    
    // Add request body if present
    const requestBody = (res as Response).locals.requestBody;
    if (requestBody && (typeof requestBody === 'object' ? Object.keys(requestBody).length > 0 : true)) {
        let formattedRequestBody = '';
        
        if (typeof requestBody === 'object') {
            try {
                formattedRequestBody = JSON.stringify(requestBody, null, 2);
                formattedRequestBody = formattedRequestBody.split('\n').map(line => '  ' + line).join('\n');
            } catch {
                formattedRequestBody = String(requestBody);
            }
        } else {
            try {
                const parsed = JSON.parse(requestBody);
                formattedRequestBody = JSON.stringify(parsed, null, 2);
                formattedRequestBody = formattedRequestBody.split('\n').map(line => '  ' + line).join('\n');
            } catch {
                formattedRequestBody = String(requestBody);
            }
        }
        
        requestInfo += chalk.gray('\n  Request Body:\n') + chalk.white(formattedRequestBody);
    }

    // Get response body (if available)
    let responseBody = (res as Response).locals.body || '';
    let formattedResponseBody = '';
    
    if (responseBody) {
        // Try to format as JSON if it's an object
        if (typeof responseBody === 'object') {
            try {
                // Pretty print JSON with 2 spaces indentation
                formattedResponseBody = JSON.stringify(responseBody, null, 2);
                // Add indentation to each line for better alignment
                formattedResponseBody = formattedResponseBody.split('\n').map(line => '  ' + line).join('\n');
            } catch {
                formattedResponseBody = String(responseBody);
            }
        } else {
            // If it's already a string, try to parse and format it
            try {
                const parsed = JSON.parse(responseBody);
                formattedResponseBody = JSON.stringify(parsed, null, 2);
                // Add indentation to each line for better alignment
                formattedResponseBody = formattedResponseBody.split('\n').map(line => '  ' + line).join('\n');
            } catch {
                formattedResponseBody = String(responseBody);
            }
        }
    }
    
    // Format response body for logging
    const responseLog = formattedResponseBody ? chalk.gray('\n  Response:\n') + chalk.white(formattedResponseBody) : '';

    return [
        chalk.gray(timestamp),
        chalk.blue.bold(tokens.method(req, res)),
        statusColor,
        chalk.white(tokens.url(req, res)),
        chalk.yellow(tokens['response-time'](req, res) + ' ms'),
        requestInfo,
        responseLog
    ].join(' ');
});

export const setupLogger = (app: Application): void => {
    // Add request/response body capture middleware BEFORE morgan
    app.use(captureRequestResponseBody);
    app.use(morganMiddleware);
};