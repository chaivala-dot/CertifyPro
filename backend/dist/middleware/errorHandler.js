"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const logger_js_1 = require("../utils/logger.js");
const zod_1 = require("zod");
// A custom error class so we can pass HTTP status codes easily
class AppError extends Error {
    constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    // Catch Zod input validation errors
    if (err instanceof zod_1.ZodError) {
        const zodIssues = err.errors;
        res.status(400).json({
            success: false,
            error: "Validation failed",
            code: "VALIDATION_ERROR",
            details: zodIssues.map((e) => ({
                path: Array.isArray(e.path) ? e.path.join(".") : e.path,
                message: e.message
            })),
        });
        return;
    }
    // Catch our custom AppError
    if (err instanceof AppError) {
        if (err.statusCode === 500) {
            logger_js_1.logger.error(`AppError: ${err.message}`, { path: req.path, stack: err.stack, code: err.code });
        }
        else {
            logger_js_1.logger.warn(`AppError (${err.statusCode}): ${err.message}`, { path: req.path, code: err.code });
        }
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            code: err.code,
        });
        return;
    }
    // Catch unhandled errors
    logger_js_1.logger.error(`Unhandled Error: ${err.message}`, { path: req.path, stack: err.stack });
    res.status(500).json({
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map