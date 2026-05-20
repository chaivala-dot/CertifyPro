"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jwt_js_1 = require("../utils/jwt.js");
const errorHandler_js_1 = require("./errorHandler.js");
function requireAuth(req, res, next) {
    // Check cookies first
    let token = req.cookies?.token;
    // Fallback to Authorization Bearer header
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(new errorHandler_js_1.AppError("Not authorized, no token provided", 401, "UNAUTHORIZED"));
    }
    const payload = (0, jwt_js_1.verifyJwt)(token);
    if (!payload) {
        return next(new errorHandler_js_1.AppError("Not authorized, invalid token", 401, "INVALID_TOKEN"));
    }
    req.user = {
        id: payload.sub,
        email: payload.email,
    };
    next();
}
//# sourceMappingURL=auth.js.map