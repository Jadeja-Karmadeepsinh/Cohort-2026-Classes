import mongoose from "mongoose";

const accessTokenSchema = new mongoose.Schema(
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
    },
    {
        timestamps: true,
    }
);

accessTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AccessToken = mongoose.model("AccessToken", accessTokenSchema);