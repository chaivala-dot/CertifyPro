import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

/**
 * Validates the Express request body against a provided Zod schema.
 * Throws ZodError to be caught by the global error handler if validation fails.
 */
export const validate =
    (schema: z.ZodTypeAny) =>
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                req.body = await schema.parseAsync(req.body);
                next();
            } catch (error) {
                next(error);
            }
        };
