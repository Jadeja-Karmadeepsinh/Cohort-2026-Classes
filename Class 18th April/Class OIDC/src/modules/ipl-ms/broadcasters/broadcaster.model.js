import mongoose from "mongoose";

const { Schema } = mongoose;

const broadcasterSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "Broadcaster name is required"],
        unique: true,
        minlength: [2, "Broadcaster name must be at least 2 characters"],
        maxlength: [100, "Broadcaster name cannot exceed 100 characters"],
    },
    country: {
        type: String,
        trim: true,
        required: [true, "Country is required"]
    },
    platform: {
        type: String,
        enum: ["TV", "OTT", "TV & OTT"],
        required: [true, "Broadcasting platform is required"]
    }
}, { timestamps: true });

export default mongoose.model("Broadcaster", broadcasterSchema);