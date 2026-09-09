import { importPKCS8, importSPKI, SignJWT, jwtVerify } from "jose";
import { PRIVATE_KEY, PUBLIC_KEY } from "./cert.js";

const ALGORITHM = "RS256";
const KEY_ID = "key-1";

let privateKeyPromise = null;
let publicKeyPromise = null;

const getPrivateKey = async () => {
    if(!privateKeyPromise) {
        privateKeyPromise = importPKCS8(PRIVATE_KEY, ALGORITHM);
    }

    return privateKeyPromise;
}

const getPublicKey = async () => {
    if(!publicKeyPromise) {
        publicKeyPromise = importSPKI(PUBLIC_KEY, ALGORITHM);
    }

    return publicKeyPromise;
}

export const signJwt = async ({ payload, issuer, audience, expiresIn = "10m" }) => {
    const privateKey = await getPrivateKey();

    return new SignJWT(payload)
        .setProtectedHeader({
            alg: ALGORITHM,
            typ: "JWT",
            kid: KEY_ID
        })
        .setIssuer(issuer)
        .setAudience(audience)
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(privateKey);
}

export const verifyJwt = async ({ token, issuer, audience }) => {
    const publicKey = await getPublicKey();

    return jwtVerify(
        token,
        publicKey,
        {
            issuer,
            audience,
            algorithms: [ALGORITHM],
        }
    );
}

export const JWT_KEY_ID = KEY_ID;

export const JWT_ALGORITHM = ALGORITHM;