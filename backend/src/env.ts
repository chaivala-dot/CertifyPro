import dotenv from "dotenv";

dotenv.config();

const REQUIRED_VARS = ["DATABASE_URL", "JWT_SECRET"] as const;

type RequiredVar = (typeof REQUIRED_VARS)[number];

const MIN_JWT_SECRET_LENGTH = 32;

function getEnv(name: RequiredVar): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  if (name === "JWT_SECRET" && value.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters for adequate entropy. ` +
      `Current length: ${value.length}`
    );
  }

  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: process.env.PORT ?? "8000",
  DATABASE_URL: getEnv("DATABASE_URL"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI ?? "",
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",
};

