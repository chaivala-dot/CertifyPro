"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * Strict rate limiter for authentication endpoints.
 * Uses secure defaults to prevent brute force attacks:
 * - 5 attempts per 15 minutes per IP
 * - Returns 429 when limit exceeded
 * - Does not expose rate limit headers to avoid information leakage
 */
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    standardHeaders: false, // Don't expose rate limit headers
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({
            error: "Too many attempts. Please try again later.",
        });
    },
    keyGenerator: (req) => {
        // Use IP address as key - in production, consider X-Forwarded-For for proxies
        return req.ip || req.socket.remoteAddress || "unknown";
    },
});
/**
 * More permissive rate limiter for general API endpoints.
 */
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({
            error: "Too many requests. Please slow down.",
        });
    },
});
//# sourceMappingURL=rateLimit.js.map