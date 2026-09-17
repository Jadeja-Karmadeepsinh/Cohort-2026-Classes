import { redis } from "../common/config/redis.js";

const MAX_REQUESTS = 10;
const WINDOW_SECONDS = 20;

export async function checkSocketRateLimit(userId: string): Promise<boolean> {
    const key = `rate-limit:socket:${userId}`;

    const count = await redis.incr(key);

    if(count === 1) {
        await redis.expire(key, WINDOW_SECONDS);
    }

    return count <= MAX_REQUESTS;
}   