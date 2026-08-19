import mongoose from "mongoose";

const { Schema } = mongoose;

const seasonSchema = new Schema({
    year: {
        type: Number,
        required: [true, "Season year is required"],
        min: [2008, "Invalid season year"]
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        default: null
    },
    runnerUp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        default: null
    },
    totalMatches: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    mvp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
        default: null
    },
    orangeCap: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
        default: null
    },
    purpleCap: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
        default: null
    },
    broadcaster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Broadcaster",
        default: null
    }
}, { timestamps: true });

export default mongoose.model("Season", seasonSchema);