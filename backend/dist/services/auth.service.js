"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const db_js_1 = require("../db.js");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_js_1 = require("../utils/jwt.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
exports.authService = {
    /**
     * Register a new user and return a JWT and user object.
     */
    async signup(input) {
        const existing = await db_js_1.prisma.user.findUnique({
            where: { email: input.email }
        });
        if (existing) {
            throw new errorHandler_js_1.AppError("Email is already in use", 409, "EMAIL_IN_USE");
        }
        let passwordHash = null;
        if (input.password) {
            passwordHash = await bcryptjs_1.default.hash(input.password, 10);
        }
        const user = await db_js_1.prisma.user.create({
            data: {
                email: input.email,
                name: input.name ?? null,
                picture: input.picture ?? null,
                passwordHash,
            }
        });
        const token = (0, jwt_js_1.signJwt)({ sub: user.id, email: user.email });
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture
            },
            token
        };
    },
    /**
     * Log in an existing user and return a JWT and user object.
     */
    async login(email, passwordAttempt) {
        const user = await db_js_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user || !user.passwordHash) {
            throw new errorHandler_js_1.AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
        }
        const isMatch = await bcryptjs_1.default.compare(passwordAttempt, user.passwordHash);
        if (!isMatch) {
            throw new errorHandler_js_1.AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
        }
        const token = (0, jwt_js_1.signJwt)({ sub: user.id, email: user.email });
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture
            },
            token
        };
    },
    /**
     * Look up a user by ID.
     */
    async getUserById(id) {
        const user = await db_js_1.prisma.user.findUnique({
            where: { id }
        });
        if (!user) {
            throw new errorHandler_js_1.AppError("User not found", 404, "USER_NOT_FOUND");
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture
        };
    }
};
//# sourceMappingURL=auth.service.js.map