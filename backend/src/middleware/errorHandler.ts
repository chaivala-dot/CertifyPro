import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";
import { ZodError } from "zod";

// A custom error class so we can pass HTTP status codes easily
export class AppError extends Error {
    public statusCode: number;
    public code: string;

    constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR") {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Catch Zod input validation errors
    if (err instanceof ZodError) {
        const zodIssues = (err as any).errors as any[];
        res.status(400).json({
            success: false,
            error: "Validation failed",
            code: "VALIDATION_ERROR",
            details: zodIssues.map((e: any) => ({
                path: Array.isArray(e.path) ? e.path.join(".") : e.path,
                message: e.message
            })),
        });
        return;
    }

    // Catch our custom AppError
    if (err instanceof AppError) {
        if (err.statusCode === 500) {
            logger.error(`AppError: ${err.message}`, { path: req.path, stack: err.stack, code: err.code });
        } else {
            logger.warn(`AppError (${err.statusCode}): ${err.message}`, { path: req.path, code: err.code });
        }

        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            code: err.code,
        });
        return;
    }

    // Catch unhandled errors
    logger.error(`Unhandled Error: ${err.message}`, { path: req.path, stack: err.stack });
    res.status(500).json({
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
    });
};
