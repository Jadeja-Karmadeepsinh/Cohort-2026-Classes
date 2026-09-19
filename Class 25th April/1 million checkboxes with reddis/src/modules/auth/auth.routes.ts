import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { rateLimiter } from "../../common/middleware/ip.rateLimiter.js";
import { requireAuth } from "../../common/middleware/auth.middleware.js";

const router = Router();

const authRateLimiter = rateLimiter({
    maxRequests: 5,
    windowSeconds: 60,
    keyPrefix: "rate-limit:auth"
});

router.post('/register', authRateLimiter, AuthController.register);
router.post('/login', authRateLimiter, AuthController.login);
// router.post('/refresh', AuthController.refresh); //! Not working yet
// router.post('/logout', AuthController.logout); //! Not working yet
router.get('/me', requireAuth, AuthController.getCurrentUser);

export const authRoutes = router;
