import type { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt.js";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const payload = verifyJwt(token);
  if (!payload) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.userId = payload.sub;
  req.userEmail = payload.email;

  return next();
}

