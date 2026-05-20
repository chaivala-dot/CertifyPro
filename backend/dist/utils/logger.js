"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const env_js_1 = require("../env.js");
const { combine, timestamp, printf, colorize, errors } = winston_1.default.format;
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
    let msg = `[${timestamp}] ${level}: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    if (stack) {
        msg += `\n${stack}`;
    }
    return msg;
});
exports.logger = winston_1.default.createLogger({
    level: env_js_1.env.NODE_ENV === "production" ? "info" : "debug",
    format: combine(errors({ stack: true }), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), env_js_1.env.NODE_ENV !== "production" ? colorize() : winston_1.default.format.uncolorize(), logFormat),
    transports: [
        new winston_1.default.transports.Console()
    ],
});
//# sourceMappingURL=logger.js.map