import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

/*
 * Project root:
 *
 * src/common/utils/cert.js
 *       ↑
 * __dirname = src/common/utils
 *
 * ../../.. = project root
*/
const PROJECT_ROOT = path.resolve(
    __dirname,
    "../../.."
);

const PRIVATE_KEY_PATH = path.join(
    PROJECT_ROOT,
    "cert",
    "private-key.pem"
);

const PUBLIC_KEY_PATH = path.join(
    PROJECT_ROOT,
    "cert",
    "public-key.pub"
);

if(!fs.existsSync(PRIVATE_KEY_PATH)) {
    throw new Error(
        `Private key not found: ${PRIVATE_KEY_PATH}`
    );
}

if (!fs.existsSync(PUBLIC_KEY_PATH)) {
    throw new Error(
        `Public key not found: ${PUBLIC_KEY_PATH}`
    );
}

export const PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH, "utf8");

export const PUBLIC_KEY = fs.readFileSync(PUBLIC_KEY_PATH, "utf8");
