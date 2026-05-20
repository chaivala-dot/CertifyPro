import rateLimit from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";

/**
 * Strict rate limiter for authentication endpoints.
 * Uses secure defaults to prevent brute force attacks:
 * - 5 attempts per 15 minutes per IP
 * - Returns 429 when limit exceeded
 * - Does not expose rate limit headers to avoid information leakage
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    standardHeaders: false, // Don't expose rate limit headers
    legacyHeaders: false,
    handler: (_req: Request, res: Response) => {
        res.status(429).json({
            error: "Too many attempts. Please try again later.",
        });
    },
    keyGenerator: (req: Request): string => {
        // Use IP address as key - in production, consider X-Forwarded-For for proxies
        return req.ip || req.socket.remoteAddress || "unknown";
    },
});

/**
 * More permissive rate limiter for general API endpoints.
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, res: Response) => {
        res.status(429).json({
            error: "Too many requests. Please slow down.",
        });
    },
});
