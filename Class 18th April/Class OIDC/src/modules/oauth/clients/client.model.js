import mongoose from 'mongoose';

const oauthClientSchema = new mongoose.Schema({
    clientId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },

    clientSecretHash: {
        type: String,
        required: true,
    },

    name: {
        type: String,
        required: true,
        trim: true,
    },

    redirectUris: {
        type: [String],
        required: true,
        validate: {
            validator: function (uris) {
                return uris.length > 0;
            },
            message: "At least one redirect URI is required",
        },
    },

    allowedScopes: {
        type: [String],
        required: true,
        default: ["openid"],
    },

    tokenEndpointAuthMethod: {
        type: String,
        enum: [
            "client_secret_basic",
            "client_secret_post",
            "none",
        ],
        default: "client_secret_basic",
    },

    active: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export const OAuthClient = mongoose.model(
    "OAuthClient",
    oauthClientSchema
);