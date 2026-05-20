"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_js_1 = require("./env.js");
const db_js_1 = require("./db.js");
const auth_js_1 = require("./routes/auth.js");
const templates_js_1 = require("./routes/templates.js");
const batches_js_1 = require("./routes/batches.js");
const certificates_js_1 = require("./routes/certificates.js");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Health check with database connectivity
app.get("/health", async (_req, res) => {
    try {
        await db_js_1.prisma.$queryRaw `SELECT 1`;
        res.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            db: "connected",
        });
    }
    catch {
        // Log internally but don't expose error details to client
        console.error("Health check failed: database connectivity issue");
        res.status(503).json({
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            db: "disconnected",
        });
    }
});
app.use("/api/auth", auth_js_1.authRouter);
app.use("/api/templates", templates_js_1.templatesRouter);
app.use("/api/batches", batches_js_1.batchesRouter);
app.use("/api/certificates", certificates_js_1.certificatesRouter);
// Global Error Handler (must be after all routes)
const errorHandler_js_1 = require("./middleware/errorHandler.js");
app.use(errorHandler_js_1.errorHandler);
app.listen(env_js_1.env.PORT, () => {
    console.log(`Server is running on port ${env_js_1.env.PORT}`);
});
//# sourceMappingURL=index.js.map