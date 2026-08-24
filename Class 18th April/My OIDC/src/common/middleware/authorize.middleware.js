import { ApiError } from "../utils/api-error.js"

export const authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            throw ApiError.forbidden("You do not have permission to perform this action");
        }

        next();
    }
}