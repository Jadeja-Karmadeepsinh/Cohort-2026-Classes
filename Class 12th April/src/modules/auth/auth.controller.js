import { AuthService } from './auth.service.js';
import { env } from '../../common/config/env.js';
import { ApiError } from '../../common/utils/api-error.js';
import { ApiResponse } from '../../common/utils/api-response.js';
import { registerSchema, loginSchema } from './dto/auth.dto.js';

const setRefreshCookie = (res, token) => {
    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
}

const setAccessCookie = (res, token) => {
    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000
    });
}

export class AuthController {
    static async register(req, res, next) {
        try {
            const validatedData = registerSchema.parse(req.body);

            const { user, accessToken, refreshToken } = await AuthService.register(validatedData);

            setAccessCookie(res, accessToken);
            setRefreshCookie(res, refreshToken);

            ApiResponse.created(res, "User registered successfully", { user });
        } catch (error) {
            next(error);
        }
    }

    static async login(req, res, next) {
        try {
            const validatedData = loginSchema.parse(req.body);

            const { user, accessToken, refreshToken } = await AuthService.login(validatedData);

            setAccessCookie(res, accessToken);
            setRefreshCookie(res, refreshToken);

            ApiResponse.ok(res, "Login successful", { user });
        } catch (error) {
            next(error);
        }
    }

    static async refresh(req, res, next) {
        try {
            const token = res.cookies?.refreshToken;

            if(!token) {
                throw ApiError.unauthorized("Refresh token is missing");
            }

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await AuthService.refresh(token);

            ApiResponse.ok(res, "Access token refreshed successfully", null);
        } catch (error) {
            next(error);
        }
    }

    static async logout(req, res, next) {
        try {
            const token = res.cookies?.refreshToken;

            if(!token) {
                throw ApiError.unauthorized("Refresh token is missing");
            }

            await AuthService.logout(token);

            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            res.status(200).json({
                success: true,
                message: "Logged out successfully"
            })
        } catch (error) {
            next(error);
        }
    }

    static async getMe(req, res, next) {
        try {
            const id = req.user._id;
            const user = await AuthService.getMe(id);

            ApiResponse.ok(res, "User fetched successfully", { user });
        } catch (error) {
            next(error);
        }
    }
}