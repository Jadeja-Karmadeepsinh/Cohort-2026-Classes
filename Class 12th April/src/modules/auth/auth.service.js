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
    const tokenHash = hashToken(refreshToken);
    
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
        if(existingUser) {
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
            user: sanitizedUser,
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
        }).select("+password");

        //if not then send user error not found
        if(!user) {
            throw ApiError.unauthorized("Incorrect email or password");
        }

        //compare user password
        const isPassValid = await user.comparePassword(data.password);

        //if dont match then send error
        if(!isPassValid) {
            throw ApiError.unauthorized("Incorrect email or password");
        }

        //if matches then create tokens
        const accessToken = generateAccessToken({
            userId: user._id
        });

        const refreshToken = generateRefreshToken({
            userId: user._id
        });

        //hash refresh token and save in db
        await saveRefreshToken(user._id, refreshToken);

        //sanitze the user
        const sanitizedUser = sanitizeUser(user);

        //send sanitized user and tokens back
        return {
            user: sanitizedUser,
            accessToken,
            refreshToken
        }
    }
    
    static async refresh(token) {
        //check if token exsists
        if(!token) {
            throw ApiError.unauthorized("Refresh token required");
        }

        //verify the token 
        verifyRefreshToken(token);
        
        //hash the token and query db for the token
        const tokenHash = hashToken(token);

        const storedToken = await RefreshToken.findOne({
            tokenHash,
            revokedAt: null,
            expiresAt: { $gt: new Date() }
        });

        //if token not exsists in db then throw error
        if(!storedToken) {
            throw ApiError.unauthorized("Invalid or expired refresh token");
        }

        //if token exsists then query db for user 
        const user = await User.findById(storedToken.userId).select("name email role");

        //if user not exsists then throw error
        if(!user) {
            throw ApiError.unauthorized("User no longer exists");
        }

        //if user exsists then create new tokens
        const newAccessToken = generateAccessToken({
            userId: user._id
        });

        const newRefreshToken = generateRefreshToken({
            userId: user._id
        });

        //revoke the old token in db
        storedToken.revokedAt = new Date();
        await storedToken.save();

        //hash and save new token in db
        await saveRefreshToken(user._id, newRefreshToken);

        //return new tokens
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        }
    }

    static async logout(token) {
        //check if token is passed
        if(!token) {
            return
        }

        //verify the token
        verifyRefreshToken(token);

        //hash the token
        const tokenHash = hashToken(token);

        //find hash in db
        const storedToken = await RefreshToken.findOne({
            tokenHash,
            revokedAt: null
        });

        //if not exsists in db send error
        if(!storedToken) {
            throw ApiError.unauthorized("Invalid refresh token");
        }

        //otherwise revoke the token and save in db
        storedToken.revokedAt = new Date();

        await storedToken.save();
    }

    static async getMe(id) {
        //check if id is passed otherwise return
        if(!id) {
            throw ApiError.unauthorized("User not authenticated");
        }

        //find user by id in the db
        const user = await User.findById(id);

        //if user doesnt exsists then send error back
        if(!user) {
            throw ApiError.unauthorized("User not found");
        }

        //if user exsists then sanitze user
        const sanitizedUser = sanitizeUser(user);

        //send sanitized user back
        return sanitizedUser;
    }
}