import type { Request, Response } from "express";
import express from "express";
import fetch from "node-fetch";
import { prisma } from "../db.js";
import { signJwt } from "../utils/jwt.js";
import { env } from "../env.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { authController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const COOKIE_NAME = "token";

function setAuthCookie(res: Response, token: string) {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "lax" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

// ==== Google OAuth Flow ====
router.get("/google", (_req: Request, res: Response) => {
  const redirectUri =
    env.GOOGLE_REDIRECT_URI ||
    "http://localhost:8000/api/auth/google/callback";

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.redirect(url);
});

router.get("/google/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;

  if (!code) {
    return res.status(400).json({ error: "Missing code" });
  }

  const redirectUri =
    env.GOOGLE_REDIRECT_URI ||
    "http://localhost:8000/api/auth/google/callback";

  const tokenResponse = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    },
  );

  if (!tokenResponse.ok) {
    return res
      .status(400)
      .json({ error: "Failed to exchange code for tokens" });
  }

  const tokenJson = (await tokenResponse.json()) as {
    access_token: string;
    id_token?: string;
  };

  const userInfoResponse = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
      },
    },
  );

  if (!userInfoResponse.ok) {
    return res.status(400).json({ error: "Failed to fetch user info" });
  }

  const profile = (await userInfoResponse.json()) as {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
  };

  if (!profile.email) {
    return res.status(400).json({ error: "Google account has no email" });
  }

  const provider = "google";
  const providerAccountId = profile.sub;

  let account = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId,
      },
    },
    include: { user: true },
  });

  if (!account) {
    const user = await prisma.user.upsert({
      where: { email: profile.email },
      update: {
        name: profile.name ?? null,
        picture: profile.picture ?? null,
      },
      create: {
        email: profile.email,
        name: profile.name ?? null,
        picture: profile.picture ?? null,
      },
    });

    account = await prisma.account.create({
      data: {
        provider,
        providerAccountId,
        userId: user.id,
        accessToken: tokenJson.access_token,
      },
      include: { user: true },
    });
  }

  const token = signJwt({
    sub: account.user.id,
    email: account.user.email,
  });
  setAuthCookie(res, token);

  res.redirect(env.FRONTEND_URL + "/dashboard");
});

// ==== Standard Credential Flow ====
router.post("/signup", authLimiter, authController.signup);
router.post("/login", authLimiter, authController.login);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.getMe);

export const authRouter = router;
