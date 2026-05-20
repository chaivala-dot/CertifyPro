"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signJwt = signJwt;
exports.verifyJwt = verifyJwt;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../env.js");
const TOKEN_EXPIRY = "7d";
function signJwt(payload) {
    return jsonwebtoken_1.default.sign(payload, env_js_1.env.JWT_SECRET, {
        expiresIn: TOKEN_EXPIRY,
    });
}
function verifyJwt(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_js_1.env.JWT_SECRET);
        if (typeof decoded === "string") {
            return null;
        }
        return decoded;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=jwt.js.map