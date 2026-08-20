import { HttpStatus } from "../constants/httpStatus.js";

export class ApiError extends Error {
    constructor (statusCode, message) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest (message = "Bad request") {
        return new ApiError(HttpStatus.BAD_REQUEST, message);
    }

    static unauthorized (message = "Unauthorized") {
        return new ApiError(HttpStatus.UNAUTHORIZED, message);
    }

    static forbidden (message = "Forbidden") {
        return new ApiError(HttpStatus.FORBIDDEN, message);
    }

    static notFound (message = "Not found") {
        return new ApiError(HttpStatus.NOT_FOUND, message);
    }

    static conflict (message = "Conflict") {
        return new ApiError(HttpStatus.CONFLICT, message);
    }

    static unprocessable (message = "Unprocessable entity") {
        return new ApiError(HttpStatus.UNPROCESSABLE_ENTITY, message);
    }

    // Added a 500 helper for database or server failures
    static internal (message = "Internal Server Error") {
        return new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, message);
    }
}   