import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
    {
        tokenHash: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "OAuthClient",
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        scope: {
            type: [String],
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },

        revokedAt: {
            type: Date,
            default: null,
        },

        replacedByTokenId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RefreshToken",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);