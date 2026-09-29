import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        minlength: 5,
        required: [true, "Name is required"]
    },

    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        required: [true, "Email is required"]
    },

    password: {
        type: String,
        required: [true, "Password is required"]
    }
}, { timestamps: true });

export default mongoose.model("User", userSchema);