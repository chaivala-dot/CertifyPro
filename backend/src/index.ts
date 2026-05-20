import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./env.js";
import { prisma } from "./db.js";
import { authRouter } from "./routes/auth.js";
import { templatesRouter } from "./routes/templates.js";
import { batchesRouter } from "./routes/batches.js";
import { certificatesRouter } from "./routes/certificates.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Health check with database connectivity
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      db: "connected",
    });
  } catch {
    console.error("Health check failed: database connectivity issue");
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      db: "disconnected",
    });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/templates", templatesRouter);
app.use("/api/batches", batchesRouter);
app.use("/api/certificates", certificatesRouter);

// Global Error Handler (must be after all routes)
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});