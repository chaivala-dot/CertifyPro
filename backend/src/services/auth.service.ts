import { prisma } from "../db.js";
import bcrypt from "bcryptjs";
import { signJwt } from "../utils/jwt.js";
import { AppError } from "../middleware/errorHandler.js";

interface SignupInput {
    email: string;
    password?: string;
    name?: string | null;
    picture?: string | null;
}

export const authService = {
    /**
     * Register a new user and return a JWT and user object.
     */
    async signup(input: SignupInput) {
        const existing = await prisma.user.findUnique({
            where: { email: input.email }
        });

        if (existing) {
            throw new AppError("Email is already in use", 409, "EMAIL_IN_USE");
        }

        let passwordHash: string | null = null;
        if (input.password) {
            passwordHash = await bcrypt.hash(input.password, 10);
        }

        const user = await prisma.user.create({
            data: {
                email: input.email,
                name: input.name ?? null,
                picture: input.picture ?? null,
                passwordHash,
            }
        });

        const token = signJwt({ sub: user.id, email: user.email });

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
    async login(email: string, passwordAttempt: string) {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || !user.passwordHash) {
            throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
        }

        const isMatch = await bcrypt.compare(passwordAttempt, user.passwordHash);
        if (!isMatch) {
            throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
        }

        const token = signJwt({ sub: user.id, email: user.email });

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
    async getUserById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            throw new AppError("User not found", 404, "USER_NOT_FOUND");
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture
        };
    }
};
