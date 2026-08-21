import mongoose from "mongoose";

const { Schema } = mongoose;

const venueModel = new Schema({
    name: {
        type: String,
        minlength: 10,
        maxlength: 100,
        trim: true,
        unique: true,
        required: [true, "Venue name is required"]
    },
    city: {
        type: String,
        required: [true, "City is required"],
        trim: true
    },
    state: {
        type: String,
        required: [true, "State is required"],
        trim: true
    },
    country: {
        type: String,
        required: [true, "Country is required"],
        trim: true
    },
    capacity: {
        type: Number,
        required: [true, "Capacity is required"],
        min: [10000, "Capacity must be at least 10000"]
    },
    pitchCondition: {
        type: String,
        enum: ["Flat Pitch", "Green Pitch", "Dry or Dusty Pitch", "Hard Pitch", "Wet Pitch"],
        default: "Flat Pitch"
    },
    isOperational: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model("Venue", venueModel);