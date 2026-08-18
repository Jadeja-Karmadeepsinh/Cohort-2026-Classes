// to sign a token we need to give payload jwt secret and options
// to verify a token we need to give token and jwt secret

import crypto from 'crypto'
import { jwt } from 'jsonwebtoken'
import { env } from '../config/env.js'
import { ApiError } from './api-error.js'

const ACCESS_SECRET = env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = env.JWT_REFRESH_SECRET;

export const generateAccessToken = (payload) => {
    const options = {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN || "15m"
    }

    return jwt.sign({ ...payload, type: "access" }, ACCESS_SECRET, options);
}

export const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, ACCESS_SECRET);

        if(decoded.type !== "access") {
            throw new Error("Wrong token type");
        }

        return decoded;
    } catch (error) {
        if(error instanceof jwt.TokenExpiredError) {
            console.warn("[JWT] Access token expired");
        }

        throw ApiError.unauthorized("Invalid or expired access token");
    }
}

export const generateRefreshToken = (payload) => {
    const options = {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN || "7d"
    }

    return jwt.sign({ ...payload, type: "refresh" }, REFRESH_SECRET, options);
}

export const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, REFRESH_SECRET);

        if(decoded.type !== "refresh") {
            throw new Error("Wrong token type");
        }

        return decoded;
    } catch (error) {
        if(error instanceof jwt.TokenExpiredError) {
            console.warn("[JWT] Refresh token expired");
        }

        throw ApiError.unauthorized("Invalid or expired refresh token");
    }
}

export const generateResetToken = () => {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    return { rawToken, hashedToken, resetTokenExpiresAt };
}