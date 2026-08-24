import mongoose from "mongoose";
import { ApiError } from "../utils/api-error.js";
import { ZodError } from "zod";

const isObject = (val) => {
    return typeof val === "object" && val !== null;
}

export const errorHadler = (err, req, res, next) => {
    let statusCode = 500;
    let message = "Internal Server Error";

    //! 1. Zod errors
    if(err instanceof ZodError) {
        statusCode = 400;

        message = err.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ");

        return res.status(statusCode).json({
            success: false,
            error: message
        });
    }

    //! 2. ApiErrors
    if(err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;

        if(statusCode >= 500) {
            console.error("[ApiError 5xx]:", err);
        }

        return res.status(statusCode).json({
            success: false,
            error: message
        })
    }

    //! 3. Mongoose Validation Error
    if(err instanceof mongoose.Error.ValidationError) {
        statusCode = 400;

        message = Object.values(err.errors)
            .map((error) => error.message)
            .join(", ");

        return res.status(statusCode).json({
            success: false,
            error: message
        });
    }

    //! 4. Invalid MongoDB ObjectId
    if(err instanceof mongoose.Error.CastError) {
        statusCode = 400;

        return res.status(statusCode).json({
            success: false,
            error: `Invalid ${err.path}`
        });
    }

    //! 5. MongoDB Duplicate Key Error
    if(isObject(err) && err.code === 11000) {
        statusCode = 409;

        const field = Object.keys(err.keyPattern || {})[0];

        return res.status(statusCode).json({
            success: false,
            error: field
                ? `${field} already exists.`
                : "A record with this information already exists."
        });
    }

    //! 6. Unknown Error
    console.error("[Unhandled Error]:", err);

    return res.status(statusCode).json({
        success: false,
        error: message
    });
}