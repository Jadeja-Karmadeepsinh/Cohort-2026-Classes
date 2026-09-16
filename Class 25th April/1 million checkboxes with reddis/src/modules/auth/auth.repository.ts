import { redis } from "../../common/config/redis.js";

export interface RedisUser {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
}

export interface CreateUserData {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
}

export class AuthRepository {
    static async createUser(
        data: CreateUserData
    ): Promise<RedisUser> {
        //1. set user:data.id key with the value given in data
        await redis.hset(`user:${data.id}`, {
            id: data.id,
            name: data.name,
            email: data.email,
            passwordHash: data.passwordHash
        });

        //2. set user:email:data.email key to store the userid with this key
        await redis.set(`user:email:${data.email}`, data.id);

        return {
            id: data.id,
            name: data.name,
            email: data.email,
            passwordHash: data.passwordHash
        } as RedisUser;
    }

    static async findUserByEmail(
        email: string
    ): Promise<RedisUser | null> {
        //1. query redis for email and get userid
        const userId = await redis.get(`user:email:${email}`);

        //2. if not exsist return null
        if(!userId) {
            return null;
        }

        //3. return by callinf findUserById(userId)
        return this.findUserById(userId);
    }

    static async findUserById(
        userId: string
    ): Promise<RedisUser | null> {
        //1. query redis with userId
        const user = await redis.hgetall(`user:${userId}`);

        //2. if user with id doesnt exsists return null
        if (!user.id || !user.name || !user.email || !user.passwordHash) {
            return null;
        }

        //3. return the user as RedisUser
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            passwordHash: user.passwordHash
        } as RedisUser;
    }
}
