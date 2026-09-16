import { Redis } from "ioredis";
import { env } from "./env.js";

function createRedisConnection() {
    return new Redis(env.REDIS_URL);
}

export const redis = createRedisConnection();

export const publisher = createRedisConnection();

export const subscriber = createRedisConnection();