import bycrpt from "bcrypt";
import crypto from "crypto";
import { AuthRepository } from "./auth.repository.js";
import { RefreshTokenRepository } from "./auth.refreshToken.repository.js";
import { ApiError } from "../../common/utils/api-error.js";
import type { RedisUser } from "./auth.repository.js";
import { hashToken } from "../../common/utils/toeken-hash.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} from "../../common/utils/jwt-utils.js";
import type {
    RegisterInput,
    LoginInput
} from "./dto/auth.dto.js";

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

const sanitizeUser = (user: RedisUser) => ({
    id: user.id,
    name: user.name,
    email: user.email
});


export class AuthService {
    static async register(data: RegisterInput) {
        //1.check wether user already exsists in redis
        const exsistingUser = await AuthRepository.findUserByEmail(data.email);

        //2. if yes send api error
        if(exsistingUser) {
            throw ApiError.conflict("A user with this email already exists");
        }

        //3. if not then create password hash
        const hashedPassword = await bycrpt.hash(data.password, 12);

        //4. store the user in redis
        const newUser = await AuthRepository.createUser({
            id: crypto.randomUUID(),
            name: data.name,
            email: data.email,
            passwordHash: hashedPassword
        });

        //5. create accesstoken and refreshtoken
        const accessToken = generateAccessToken({ userId: newUser.id });
        // const refreshToken = generateRefreshToken({ userId: newUser.id});

        //6. save hashed refreshtoken in redis
        // const hashedRefreshToken = hashToken(refreshToken);
        // await RefreshTokenRepository.saveRefreshToken(newUser.id, hashedRefreshToken, Date.now() + REFRESH_TOKEN_TTL);

        //7. sanitize the user
        const sanitizedUser = sanitizeUser(newUser);

        //8. return user accesstoken and refreshtoken
        // return {
        //     user: sanitizedUser,
        //     accessToken,
        //     refreshToken
        // };

        return {
            user: sanitizedUser,
            accessToken,
        };
    }

    static async login(data: LoginInput) {
        //1. find user by email
        const user = await AuthRepository.findUserByEmail(data.email);

        //2. if not exsist send api error
        if(!user) {
            throw ApiError.unauthorized("Incorrect email or password");
        }

        //3. if exsists compare the password with the hash stored in redis
        const isPasswordValid = await bycrpt.compare(data.password, user.passwordHash);

        //4. if not match send api error
        if(!isPasswordValid) {
            throw ApiError.unauthorized("Incorrect email or password")
        }

        //5. if matach create access and refreshtoken
        const accessToken = generateAccessToken({ userId: user.id });
        // const refreshToken = generateRefreshToken({ userId: user.id });

        //6. save hashed refreshtoken in redis
        // const hashedRefreshToken = hashToken(refreshToken);
        // await RefreshTokenRepository.saveRefreshToken(user.id, hashedRefreshToken, Date.now() + REFRESH_TOKEN_TTL);

        //7. sanitize the user
        const sanitizedUser = sanitizeUser(user);

        //8. return user accesstoken and refreshtoken
        // return {
        //     user: sanitizedUser,
        //     accessToken,
        //     refreshToken
        // };

        return {
            user: sanitizedUser,
            accessToken,
        };
    }

    static async refresh(token: string) {
        //1. verify the refreshtoken 
        const decoded = verifyRefreshToken(token);

        //2. check wether user with given id in refreshtoken exsists in redis or not
        const user = await AuthRepository.findUserById(decoded.userId);

        //3. if not send api error
        if(!user) {
            throw ApiError.unauthorized("User no longer exists");
        }

        //4. if exsists create new access and refreshtokens
        const newAccessToken = generateAccessToken({ userId: user.id });
        const newRefreshToken = generateRefreshToken({ userId: user.id });
        
        //5. save hashed refreshtoken in db
        const hashedRefreshToken = hashToken(newRefreshToken);
        await RefreshTokenRepository.saveRefreshToken(user.id, hashedRefreshToken, Date.now() + REFRESH_TOKEN_TTL);

        //6. return new access and refreshtoken
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    }

    static async logout(token: string) {
        //1. check if the refreshtoken exsists or not 
        if(!token) {
            //2. if not then return
            return;
        }

        //3. verify the refreshtoken
        let decoded;
        try {
            decoded = verifyRefreshToken(token);
        } catch (error) {
            //4. if expired or wrong return 
            return;
        }
        
        //5. query in redis for the refreshtoken and delete
        await RefreshTokenRepository.deleteRefreshToken(decoded.userId);
    }
}
