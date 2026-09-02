import mongoose from "mongoose";

const authorizationCodeSchema = new mongoose.Schema(
    {
        codeHash: {
            type: String,
            required: true,
            unique: true
        },

        clientId: {
            type: String,
            required: true,
            index: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        redirectUri: {
            type: String,
            required: true
        },

        scope: {
            type: String,
            required: true
        },

        nonce: {
            type: String
        },

        codeChallenge: {
            type: String
        },

        codeChallengeMethod: {
            type: String
        },

        expiresAt: {
            type: Date,
            required: true
        },

        used: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export const AuthorizationCode =
    mongoose.model("AuthorizationCode", authorizationCodeSchema);