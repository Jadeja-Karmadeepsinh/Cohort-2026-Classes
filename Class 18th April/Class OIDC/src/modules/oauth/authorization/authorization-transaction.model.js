import mongoose from "mongoose";

const authorizationTransactionSchema = new mongoose.Schema(
    {
        transactionId: {
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
            default: null,
        },

        redirectUri: {
            type: String,
            required: true,
        },

        scope: {
            type: [String],
            required: true,
        },

        state: {
            type: String,
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

        status: {
            type: String,
            enum: [
                "pending",
                "approved",
                "denied",
                "completed",
            ],
            default: "pending",
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

authorizationTransactionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); 
//expireAfterSeconds: 0 tells MongoDB to automatically delete a document when the exact time stored in the expiresAt field is reached.
//0 Seconds Delay: Setting the value to 0 means the document expires 0 seconds after the exact date and time recorded inside its expiresAt field. If expiresAt is set to 2026-06-01T12:00:00Z, MongoDB deletes it right at that timestamp (plus a short background sweep delay).
//Background Cleanup: MongoDB runs a background thread every 60 seconds to remove expired documents. Because of this sweep, deletion might be delayed by up to a minute after the target time.

export const AuthorizationTransaction = mongoose.model("AuthorizationTransaction", authorizationTransactionSchema);