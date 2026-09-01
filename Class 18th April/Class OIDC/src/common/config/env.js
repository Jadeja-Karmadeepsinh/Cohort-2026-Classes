import 'dotenv/config';
import z from 'zod';

const envSchema = z.object({
    PORT: z.coerce.number().int().positive().default(4000),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    MONGODB_URI: z.string().startsWith("mongodb", { message: "Must be a valid MongoDB connection string" }),
    JWT_ACCESS_SECRET: z.string().min(32, { message: "JWT access secret must be at least 32 characters" }),
    JWT_REFRESH_SECRET: z.string().min(32, { message: "JWT refresh secret must be at least 32 characters" }),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d")
});

export const env = envSchema.parse(process.env);