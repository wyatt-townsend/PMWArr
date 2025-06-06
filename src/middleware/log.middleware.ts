import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.util.js';

/**
 * Middleware to log incoming requests and their response times.
 * Logs the HTTP method, URL, status code, and duration of the request.
 */
export function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
    const start = Date.now(); // Track request start time

    // After response is finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { method, originalUrl } = req;
        const { statusCode } = res;

        logger.info({
            message: 'Request completed',
            method: method,
            url: originalUrl,
            statusCode: statusCode,
            duration: `${duration}ms`,
        });
    });

    next();
}
