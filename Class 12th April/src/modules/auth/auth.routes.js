import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { AuthController } from "./auth.controller.js";
import { requireAuth } from "../../common/middleware/auth.middleware.js";

const router = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        error: "Too many attempts from this IP, please try again after 15 minutes"
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: {
        xForwardedForHeader: false,
        trustProxy: false
    }
})

//! Rate limited routes
router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);

//! Non rate limit routes
router.post('/refresh', AuthController.refresh);
router.post('logout', AuthController.logout);

//! Authenticated route
router.get('/me', requireAuth, AuthController.getMe);

export const authRoutes = router;