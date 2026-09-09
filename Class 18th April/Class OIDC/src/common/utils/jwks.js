import { importSPKI, exportJWK } from 'jose';
import { PUBLIC_KEY } from './cert.js';
import { JWT_ALGORITHM, JWT_KEY_ID } from './jwt.js';

let publicJwkPromise = null;

const getPublicJwk = async () => {
    if(!publicJwkPromise) {
        publicJwkPromise = (async () => {
            const publicKey = await importSPKI(
                PUBLIC_KEY,
                JWT_ALGORITHM
            );

            const jwk = await exportJWK(
                publicKey
            );

            return {
                ...jwk,
                kid: JWT_KEY_ID,
                use: "sig",
                alg: JWT_ALGORITHM
            };
        })();
    }

    return publicJwkPromise;
}

export const getJWKS = async () => {
    const publicJwk = await getPublicJwk();

    return {
        keys: [publicJwk]
    };
}