import { verifyAccessToken } from '../utils/jwt-utils.js';
import { ApiError } from '../utils/api-error.js';
import User from '../../modules/auth/auth.model.js';

export const requireAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;

        if(!token) {
            throw ApiError.unauthorized("Authentication required");
        }

        const decoded = verifyAccessToken(token);

        //check the user in db
        //! Check here there might be a bug
        const result = await User.findById(decoded.userId).select("name email role");

        if(!result) {
            throw ApiError.unauthorized("User not authorized");
        }

        req.user = result;

        next();
    } catch (error) {
        next(error);
    }
}