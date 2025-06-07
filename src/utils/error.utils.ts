import { HttpStatusCode, ErrorCode } from './codes.util.js';

export class AppError extends Error {
    public statusCode: HttpStatusCode;
    public code: ErrorCode;

    constructor(message: string = 'Something went wrong', statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR, code = ErrorCode.INTERNAL_SERVER_ERROR) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;

        // Ensure instanceof works
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
