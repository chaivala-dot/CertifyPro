"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const crypto_1 = __importDefault(require("crypto"));
const SALT_LENGTH_BYTES = 16;
const KEY_LENGTH_BYTES = 32;
const ITERATIONS = 100000;
const DIGEST = "sha256";
function hashPassword(password) {
    const salt = crypto_1.default.randomBytes(SALT_LENGTH_BYTES);
    const derivedKey = crypto_1.default.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH_BYTES, DIGEST);
    return [
        "pbkdf2",
        DIGEST,
        ITERATIONS.toString(),
        salt.toString("hex"),
        derivedKey.toString("hex"),
    ].join("$");
}
function verifyPassword(password, hash) {
    const parts = hash.split("$");
    if (parts.length !== 5) {
        return false;
    }
    const algo = parts[0];
    const digest = parts[1];
    const iterationsStr = parts[2];
    const saltHex = parts[3];
    const keyHex = parts[4];
    // Type guard: ensure all parts are defined
    if (!algo || !digest || !iterationsStr || !saltHex || !keyHex) {
        return false;
    }
    if (algo !== "pbkdf2" || digest !== DIGEST) {
        return false;
    }
    const iterations = Number.parseInt(iterationsStr, 10);
    if (!Number.isFinite(iterations) || iterations <= 0) {
        return false;
    }
    const salt = Buffer.from(saltHex, "hex");
    const originalKey = Buffer.from(keyHex, "hex");
    const derivedKey = crypto_1.default.pbkdf2Sync(password, salt, iterations, originalKey.length, digest);
    return crypto_1.default.timingSafeEqual(originalKey, derivedKey);
}
//# sourceMappingURL=password.js.map