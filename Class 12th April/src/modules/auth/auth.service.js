import crypto from 'crypto';
import User from './auth.model.js';
import RefreshToken from './refreshtoken.model.js';
import { ApiError } from '../../common/utils/api-error.js';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} from '../../common/utils/jwt-utils.js'

const hashToken = (token) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}

const saveRefreshToken = async (userId, refreshToken) => {
    const tokenHashed = hashToken(refreshToken);
    
    const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    )

    await RefreshToken.create({
        userId,
        tokenHash,
        expiresAt
    })
}

const sanitizeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
})

export class AuthService {
    static async register(data) {
        //find if exsisting user
        const existingUser = await User.findOne({
            email: data.email
        })

        //if user exsists throw error
        if(!existingUser) {
            throw ApiError.conflict("A user with this email already exists");
        }

        //if not then create user in db pass will get automatically hash because of pre middleware

        /*
         * Password hashing happens automatically
         * in User's pre("save") middleware.
        */
        const user = await User.create({
            name: data.name,
            email: data.email,
            password: data.password
        })
        //create refresh and access token

        const accessToken = generateAccessToken({
            userId: user._id
        });

        const refreshToken = generateRefreshToken({
            userId: user._id
        });

        //save hash of refreshtoken in db
        await saveRefreshToken(user._id, refreshToken);

        //santize the returned user from db
        const sanitizedUser = sanitizeUser(user);
    
        //send user accesstoken and refreshtoken back
        return {
            sanitizedUser,
            accessToken,
            refreshToken
        };
    }

    static async login(data) {
        //check wether user email exsists in db
        /*
         * password has select:false in schema,
         * so explicitly include it.
        */
        const user = await User.findOne({
            email: data.email
        });

        //if not then send user error not found
        //if exsiste then fetch user from db
        //compare user password
        //if dont match then send error
        //if matches then create tokens
        //hash refresh token and save in db
        //sanitze the user
        //send sanitized user and tokens back
    }
    
    static async refresh(token) {

    }

    static async logout(token) {

    }

    static async getMe(id) {

    }
}