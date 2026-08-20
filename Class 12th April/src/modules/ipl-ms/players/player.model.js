import mongoose from "mongoose";

const { Schema } = mongoose;

const playerSchema = new Schema({
    name: {
        type: String,
        trim: true,
        minlength: 5,
        maxlength: 100,
        required: [true, "Name is required"]
    },
    age: {
        type: Number,
        required: [true, "Age is required"]
    },
    nationality: {
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 50,
        required: [true, "Nationality is required"]
    },
    role: {
        type: String,
        enum: ["batter", "bowler", "all-rounder", "wicket-keeper"],
        required: [true, "Role is required"]
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",  //! check this again
        default: null
    }
}, { timestamps: true });

export default mongoose.model("Player", playerSchema);