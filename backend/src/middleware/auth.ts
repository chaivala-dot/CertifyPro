import type { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt.js";
import { AppError } from "./errorHandler.js";

export interface AuthedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Check cookies first
  let token = req.cookies?.token as string | undefined;

  // Fallback to Authorization Bearer header
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Not authorized, no token provided", 401, "UNAUTHORIZED"));
  }

  const payload = verifyJwt(token);
  if (!payload) {
    return next(new AppError("Not authorized, invalid token", 401, "INVALID_TOKEN"));
  }

  (req as AuthedRequest).user = {
    id: payload.sub,
    email: payload.email,
  };

  next();
}
