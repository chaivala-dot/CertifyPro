import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authService } from "../services/auth.service.js";

// Validation Schemas
export const signupSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().optional(),
    picture: z.string().url("Must be a valid URL").optional(),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

export const authController = {
    async signup(req: Request, res: Response, next: NextFunction) {
        try {
            // Data is already validated if using the `validate` middleware
            const input = signupSchema.parse(req.body);
            const { user, token } = await authService.signup({
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
        } catch (error) {
            next(error);
        }
    },

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = loginSchema.parse(req.body);
            const { user, token } = await authService.login(email, password);

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
        } catch (error) {
            next(error);
        }
    },

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            res.cookie("token", "", {
                httpOnly: true,
                expires: new Date(0),
            });

            res.status(200).json({
                success: true,
                data: { message: "Logged out successfully" }
            });
        } catch (error) {
            next(error);
        }
    },

    async getMe(req: Request, res: Response, next: NextFunction) {
        try {
            // req.user is set by requireAuth middleware
            const userId = (req as any).user?.id;
            if (!userId) {
                // Should not happen if requireAuth is present
                throw new Error("No user ID found in request");
            }

            const user = await authService.getUserById(userId);

            res.status(200).json({
                success: true,
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    }
};
