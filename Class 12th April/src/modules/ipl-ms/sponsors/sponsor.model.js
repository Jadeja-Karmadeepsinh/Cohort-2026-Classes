import mongoose from "mongoose";

const { Schema } = mongoose;

const sponsorSchema = new Schema({
    name: {
        type: String,
        required: [true, "Sponsor name is required"],
        minlength: [2, "Sponsor name must be at least 2 characters"],
        maxlength: [100, "Sponsor name cannot exceed 100 characters"],
        trim: true
    },
    industry: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true
    }
}, { timestamps: true });

export default mongoose.model("Sponsor", sponsorSchema);