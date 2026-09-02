import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },

    clientId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    clientSecretHash: {
        type: String,
        required: true
    },

    redirectUris: {
        type: [String],
        required: true
    },

    allowedScopes: {
        type: [String],
        default: ["openid", "profile", "email"]
    },

    grantTypes: {
        type: [String],
        default: ["authorization_code"]
    },

    responseTypes: {
        type: [String],
        default: ["code"]
    }
}, { timestamps: true });

export const Client = mongoose.model('Client', clientSchema);