import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode, ErrorCode } from '../utils/codes.util.js';
import { AppError } from '../utils/error.utils.js';
import { logger } from '../utils/logger.util.js';

/**
 *  Middleware to handle errors in the applications.
 */
export function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction) {
    if (err instanceof AppError) {
        // Caught by a custom error
        logger.warn({
            message: err.message,
            code: err.code,
            path: req.path,
            method: req.method,
        });

        res.status(err.statusCode).json({
            code: err.code,
            message: err.message,
        });
    } else {
        // Uncaught error
        logger.error({
            error: err,
            path: req.path,
            method: req.method,
        });

        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            code: ErrorCode.INTERNAL_SERVER_ERROR,
            message: 'Something went wrong',
        });
    }

    next();
}

/**
 * Middleware to handle 404 errors for undefined routes.
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
    next(new AppError(`Route not found`, HttpStatusCode.NOT_FOUND, ErrorCode.ROUTE_NOT_FOUND));
}
