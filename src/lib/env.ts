import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1).default("mongodb://127.0.0.1:27017"),
  MONGODB_DB: z.string().default("metrics"),
  API_KEY_PEPPER: z.string().default("replace-me-in-production"),
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
});

export const env = envSchema.parse({
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DB: process.env.MONGODB_DB,
  API_KEY_PEPPER: process.env.API_KEY_PEPPER,
  APP_BASE_URL: process.env.APP_BASE_URL,
});
