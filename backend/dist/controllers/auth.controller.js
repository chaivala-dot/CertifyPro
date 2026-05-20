"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
const auth_service_js_1 = require("../services/auth.service.js");
// Validation Schemas
exports.signupSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    name: zod_1.z.string().optional(),
    picture: zod_1.z.string().url("Must be a valid URL").optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.authController = {
    async signup(req, res, next) {
        try {
            // Data is already validated if using the `validate` middleware
            const input = exports.signupSchema.parse(req.body);
            const { user, token } = await auth_service_js_1.authService.signup({
                email: input.email,
                password: input.password,
                name: input.name ?? null,
                picture: input.picture ?? null,
            });
            // Set cookie for browsers
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            res.status(201).json({
                success: true,
                data: { user, token }
            });
        }
        catch (error) {
            next(error);
        }
    },
    async login(req, res, next) {
        try {
            const { email, password } = exports.loginSchema.parse(req.body);
            const { user, token } = await auth_service_js_1.authService.login(email, password);
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            res.status(200).json({
                success: true,
                data: { user, token }
            });
        }
        catch (error) {
            next(error);
        }
    },
    async logout(req, res, next) {
        try {
            res.cookie("token", "", {
                httpOnly: true,
                expires: new Date(0),
            });
            res.status(200).json({
                success: true,
                data: { message: "Logged out successfully" }
            });
        }
        catch (error) {
            next(error);
        }
    },
    async getMe(req, res, next) {
        try {
            // req.user is set by requireAuth middleware
            const userId = req.user?.id;
            if (!userId) {
                // Should not happen if requireAuth is present
                throw new Error("No user ID found in request");
            }
            const user = await auth_service_js_1.authService.getUserById(userId);
            res.status(200).json({
                success: true,
                data: { user }
            });
        }
        catch (error) {
            next(error);
        }
    }
};
//# sourceMappingURL=auth.controller.js.map