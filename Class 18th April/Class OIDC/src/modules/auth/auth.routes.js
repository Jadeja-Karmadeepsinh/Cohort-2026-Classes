import { Router } from "express";
import { authLimiter } from "../../common/middleware/ratelimit.middleware.js";
import { AuthController } from "./auth.controller.js";
import { requireAuth } from "../../common/middleware/auth.middleware.js";

const router = Router();

//! Rate limited routes
router.post('/register', authLimiter, AuthController.register); //* Working
router.post('/login', authLimiter, AuthController.login); //* Working

//! Non rate limit routes
router.post('/refresh', AuthController.refresh); //* Working
router.post('/logout', AuthController.logout); //* Working

//! Authenticated route
router.get('/me', requireAuth, AuthController.getMe); //* Working

export const authRoutes = router;