import type { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service.js";
import { ApiResponse } from "../../common/utils/api-response.js";
import { ApiError } from "../../common/utils/api-error.js";
import { registerSchema, loginSchema } from "./dto/auth.dto.js";
import { env } from "../../common/config/env.js";

const setAccessCookie = (res: Response, token: string) => {
    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000
    });
}

const setRefreshCookie = (res: Response, token: string) => {
    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
}

export class AuthController {
    static async register(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const validatedData = registerSchema.parse(req.body);
            // const { user, accessToken, refreshToken } = await AuthService.register(validatedData);
            const { user, accessToken } = await AuthService.register(validatedData);

            setAccessCookie(res, accessToken);
            // setRefreshCookie(res, refreshToken);

            ApiResponse.created(res, "User registered successfully", { user });
        } catch (error) {
            next(error);
        }
    }

    static async login(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const validateData = loginSchema.parse(req.body);
            // const { user, accessToken, refreshToken } = await AuthService.login(validateData);
            const { user, accessToken } = await AuthService.login(validateData);

            setAccessCookie(res, accessToken);
            // setRefreshCookie(res, refreshToken);

            ApiResponse.ok(res, "Login successful", { user });
        } catch (error) {
            next(error);
        }
    }

    static async refresh(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const currentRefreshToken = req.cookies?.refreshToken;

            if(!currentRefreshToken) {
                throw ApiError.unauthorized("Refresh token is missing");
            }

            const { accessToken, refreshToken } = await AuthService.refresh(currentRefreshToken);

            setAccessCookie(res, accessToken);
            setRefreshCookie(res, refreshToken);

            ApiResponse.ok(res, "Access token refreshed successfully", null);
        } catch (error) {
            next(error);
        }
    }

    static async logout(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const refreshToken = req.cookies?.refreshToken;

            if(!refreshToken) {
                throw ApiError.unauthorized("Refresh token is missing")
            }

            await AuthService.logout(refreshToken);

            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            ApiResponse.ok(res, "Logged out successfully", null);
        } catch (error) {
            next(error);
        }
    }
}
