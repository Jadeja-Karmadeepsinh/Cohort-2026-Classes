import mongoose from "mongoose";

const { Schema } = mongoose;

const refreshTokenSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
        index: true
    },
    tokenHash: {
        type: String,
        required: [true, "Token hash is required"],
        unique: true
    },
    expiresAt: {
        type: Date,
        required: [true, "Token expiry is required"]
    },
    revokedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

export default mongoose.model("RefreshToken", refreshTokenSchema);