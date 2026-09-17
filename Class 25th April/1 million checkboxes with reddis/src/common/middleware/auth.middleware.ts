import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt-utils.js";
import { ApiError } from "../utils/api-error.js";

export function requireAuth (
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const token = req.cookies.accessToken;

        if(!token) {
            throw ApiError.unauthorized("Authentication required");
        }

        const decoded = verifyAccessToken(token);

        req.user = {
            userId: decoded.userId
        };

        next();
    } catch (error) {
        next(error);
    }
}
