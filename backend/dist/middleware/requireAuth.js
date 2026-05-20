"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jwt_js_1 = require("../utils/jwt.js");
function requireAuth(req, res, next) {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const payload = (0, jwt_js_1.verifyJwt)(token);
    if (!payload) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    req.userId = payload.sub;
    req.userEmail = payload.email;
    return next();
}
//# sourceMappingURL=requireAuth.js.map