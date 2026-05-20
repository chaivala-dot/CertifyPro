"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const db_js_1 = require("../db.js");
const jwt_js_1 = require("../utils/jwt.js");
const env_js_1 = require("../env.js");
const rateLimit_js_1 = require("../middleware/rateLimit.js");
const auth_controller_js_1 = require("../controllers/auth.controller.js");
const auth_js_1 = require("../middleware/auth.js");
const router = express_1.default.Router();
const COOKIE_NAME = "token";
function setAuthCookie(res, token) {
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
router.get("/google", (_req, res) => {
    const redirectUri = env_js_1.env.GOOGLE_REDIRECT_URI ||
        "http://localhost:8000/api/auth/google/callback";
    const params = new URLSearchParams({
        client_id: env_js_1.env.GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "consent",
    });
    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.redirect(url);
});
router.get("/google/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).json({ error: "Missing code" });
    }
    const redirectUri = env_js_1.env.GOOGLE_REDIRECT_URI ||
        "http://localhost:8000/api/auth/google/callback";
    const tokenResponse = await (0, node_fetch_1.default)("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            code,
            client_id: env_js_1.env.GOOGLE_CLIENT_ID,
            client_secret: env_js_1.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
        }).toString(),
    });
    if (!tokenResponse.ok) {
        return res
            .status(400)
            .json({ error: "Failed to exchange code for tokens" });
    }
    const tokenJson = (await tokenResponse.json());
    const userInfoResponse = await (0, node_fetch_1.default)("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
            Authorization: `Bearer ${tokenJson.access_token}`,
        },
    });
    if (!userInfoResponse.ok) {
        return res.status(400).json({ error: "Failed to fetch user info" });
    }
    const profile = (await userInfoResponse.json());
    if (!profile.email) {
        return res.status(400).json({ error: "Google account has no email" });
    }
    const provider = "google";
    const providerAccountId = profile.sub;
    let account = await db_js_1.prisma.account.findUnique({
        where: {
            provider_providerAccountId: {
                provider,
                providerAccountId,
            },
        },
        include: { user: true },
    });
    if (!account) {
        const user = await db_js_1.prisma.user.upsert({
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
        account = await db_js_1.prisma.account.create({
            data: {
                provider,
                providerAccountId,
                userId: user.id,
                accessToken: tokenJson.access_token,
            },
            include: { user: true },
        });
    }
    const token = (0, jwt_js_1.signJwt)({
        sub: account.user.id,
        email: account.user.email,
    });
    setAuthCookie(res, token);
    res.redirect(env_js_1.env.FRONTEND_URL + "/dashboard");
});
// ==== Standard Credential Flow ====
router.post("/signup", rateLimit_js_1.authLimiter, auth_controller_js_1.authController.signup);
router.post("/login", rateLimit_js_1.authLimiter, auth_controller_js_1.authController.login);
router.post("/logout", auth_controller_js_1.authController.logout);
router.get("/me", auth_js_1.requireAuth, auth_controller_js_1.authController.getMe);
exports.authRouter = router;
//# sourceMappingURL=auth.js.map