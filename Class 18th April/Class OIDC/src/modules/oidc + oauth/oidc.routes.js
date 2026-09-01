import { Router } from "express";
import path from "node:path";
import { OidcController } from "./oidc.controller.js";

const router = Router();

//! OIDC Routes
router.get('/authenticate', (req, res) => {
    return res.sendFile(path.resolve("public", "authenticate.html"));
});

router.post('/authenticate/sign-in', OidcController.SignIn);

router.post('/authenticate/sign-up', OidcController.SignUp);

router.get('/userinfo', OidcController.getUserInfo);

//! OAuth Routes
router.post('/clients', OidcController.oidcForm);

router.post('/token', OidcController.giveTokenInfo);

export const oidcRoutes = router;