import { Router } from "express";
import { env } from "../../common/config/env.js";
import { getJWKS } from "../../common/utils/jwks.js";

const router = Router();

const ISSUER = env.OIDC_ISSUER;

router.get('/.well-known/openid-configuration', (req, res) => {
    return res.json({
        issuer: ISSUER,

        authorization_endpoint: `${ISSUER}/o/authorize`,

        token_endpoint: `${ISSUER}/o/token`,

        userinfo_endpoint: `${ISSUER}/o/userinfo`,

        jwks_uri: `${ISSUER}/.well-known/jwks.json`,

        response_types_supported: [
            "code",
        ],

        subject_types_supported: [
            "public",
        ],

        id_token_signing_alg_values_supported: [
            "RS256",
        ],

        scopes_supported: [
            "openid",
            "profile",
            "email",
        ],

        claims_supported: [
            "sub",
            "iss",
            "aud",
            "exp",
            "iat",
            "auth_time",
            "nonce",
            "name",
            "email",
            "email_verified",
        ],

        grant_types_supported: [
            "authorization_code",
        ],

        code_challenge_methods_supported: [
            "S256",
        ],

        token_endpoint_auth_methods_supported: [
            "client_secret_basic",
        ],
    });
});

router.get('/.well-known/jwks.json', async (req, res, next) => {
    try {
        const jwks = await getJWKS();
        return res.json(jwks);
    } catch (error) {
        next(error);
    }
});

export const oidcRoutes = router;