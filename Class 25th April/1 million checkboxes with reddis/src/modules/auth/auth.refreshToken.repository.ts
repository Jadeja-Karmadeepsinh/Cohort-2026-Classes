import { redis } from '../../common/config/redis.js';

export class RefreshTokenRepository {
    static async saveRefreshToken(
        userId: string,
        hashedRefreshToken: string,
        refresh_token_ttl: number
    ) {
        await redis.set(
            `refresh:${userId}`,
            hashedRefreshToken,
            "EX",
            refresh_token_ttl
        );
    }

    static async getRefreshToken(
        userId: string
    ) {
        await redis.get(
            `refresh:${userId}`
        );
    }

    static async deleteRefreshToken(
        userId: string
    ) {
        await redis.del(
            `refresh:${userId}`
        );
    }
}
