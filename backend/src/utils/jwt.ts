import jwt from "jsonwebtoken";
import { env } from "../env.js";

const TOKEN_EXPIRY = "7d";

export interface JwtPayload {
  sub: string;
  email: string;
}

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === "string") {
      return null;
    }
    return decoded as JwtPayload;
  } catch {
    return null;
  }
}

