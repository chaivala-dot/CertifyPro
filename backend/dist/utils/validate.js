"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
/**
 * Validates the Express request body against a provided Zod schema.
 * Throws ZodError to be caught by the global error handler if validation fails.
 */
const validate = (schema) => async (req, res, next) => {
    try {
        req.body = await schema.parseAsync(req.body);
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map