import type { Request, Response, NextFunction } from "express";
import { redis } from "../config/redis.js";
import { ApiError } from "../utils/api-error.js";

interface RateLimiterOptions {
    maxRequests: number;
    windowSeconds: number;
    keyPrefix: string;
}

export function rateLimiter(
    options: RateLimiterOptions
) {
    return async function (
        req: Request,
        _res: Response,
        next: NextFunction
    ) {
        try {
            const ip = req.ip ?? "unknown";

            const key = `${options.keyPrefix}:${ip}`;

            const count = await redis.incr(key);

            if(count === 1) {
                await redis.expire(key, options.windowSeconds);
            }

            if(count > options.maxRequests) {
                throw ApiError.ratelimit("Too many requests. Try again later.");
            }

            next();
        } catch (error) {
            console.error("Rate limiter error:", error);

            ApiError.internal("Internal server error");
        }
    }
}
