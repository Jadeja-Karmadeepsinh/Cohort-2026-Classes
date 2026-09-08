import mongoose from "mongoose";

const authorizationCodeSchema = new mongoose.Schema(
    {
        codeHash: {
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

        redirectUri: {
            type: String,
            required: true,
        },

        scope: {
            type: [String],
            required: true,
        },

        nonce: {
            type: String,
            required: true,
        },

        codeChallenge: {
            type: String,
            required: true,
        },

        codeChallengeMethod: {
            type: String,
            enum: ["S256"],
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },

        usedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

authorizationCodeSchema.index({ expiresAt: 1}, { expireAfterSeconds: 0 });

export const AuthorizationCode = mongoose.model(
    "AuthorizationCode",
    authorizationCodeSchema
);