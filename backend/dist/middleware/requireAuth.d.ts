import type { NextFunction, Request, Response } from "express";
export interface AuthenticatedRequest extends Request {
    userId?: string;
    userEmail?: string;
}
export declare function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
//# sourceMappingURL=requireAuth.d.ts.map