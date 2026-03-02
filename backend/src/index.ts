import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./env";
import { authRouter } from "./routes/auth";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "CertifyPro v2 Backend Running" });
});

app.use("/api/auth", authRouter);

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});