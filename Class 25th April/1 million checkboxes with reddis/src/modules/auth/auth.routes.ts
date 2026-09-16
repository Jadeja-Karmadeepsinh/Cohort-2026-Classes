import { Router } from "express";
import { AuthController } from "./auth.controller.js";

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
// router.post('/refresh', AuthController.refresh); //! Not working yet
// router.post('/logout', AuthController.logout); //! Not working yet

export const authRoutes = router;
