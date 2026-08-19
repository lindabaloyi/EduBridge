import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from project root (two levels up from backend/src/config/)
dotenv.config({ path: path.resolve(__dirname, "..", "..", "..", ".env") });

export const environment = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/edubridge",
  JWT_SECRET: process.env.JWT_SECRET || "change-me-in-production",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
};