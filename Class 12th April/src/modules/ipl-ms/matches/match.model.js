import mongoose from "mongoose";

const { Schema } = mongoose;

const matchSchema = new Schema({
    team1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    team2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    result: {
        type: String,
        default: null
    },
    venue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Venue",
        required: true
    },
    status: {
        type: String,
        enum: ["scheduled", "live", "completed", "cancelled"],
        default: "scheduled",
        required: true
    }
}, { timestamps: true });

export default mongoose.model("Match", matchSchema);