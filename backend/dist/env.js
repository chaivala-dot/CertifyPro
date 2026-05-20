"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const REQUIRED_VARS = ["DATABASE_URL", "JWT_SECRET"];
const MIN_JWT_SECRET_LENGTH = 32;
function getEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    if (name === "JWT_SECRET" && value.length < MIN_JWT_SECRET_LENGTH) {
        throw new Error(`JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters for adequate entropy. ` +
            `Current length: ${value.length}`);
    }
    return value;
}
exports.env = {
    NODE_ENV: process.env.NODE_ENV ?? "development",
    PORT: process.env.PORT ?? "8000",
    DATABASE_URL: getEnv("DATABASE_URL"),
    JWT_SECRET: getEnv("JWT_SECRET"),
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI ?? "",
    FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",
};
//# sourceMappingURL=env.js.map