import crypto from "node:crypto";

/**
 * Generate cryptographically secure random bytes
 * and return them as a hexadecimal string.
 */
export const generateRandomHex = (bytes = 32) => {
    return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Generate a cryptographically secure random string
 * encoded using Base64URL.
 */
export const generateRandomBase64Url = (bytes = 32) => {
    return crypto.randomBytes(bytes).toString("base64url");
}

/**
 * Hash a value using SHA-256.
 */
export const sha256 = (value) => {
    return crypto.createHash("sha256").update(value).digest("hex");
}

/**
 * Create a SHA-256 hash and return it as Base64URL.
 *
 * This is useful for PKCE.
 */
export const sha256Base64Url = (value) => {
    return crypto.createHash("sha256").update(value).digest("base64url")
}