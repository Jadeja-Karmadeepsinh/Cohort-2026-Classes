import mongoose from "mongoose";

const { Schema } = mongoose;

const teamSchema = new Schema({
    name: {
        type: String,
        minlength: 10,
        maxlength: 50,
        trim: true,
        unique: true,
        required: [true, "Team name is required"]
    },
    shortHand: {
        type: String,
        trim: true,
        unique: true,
        required: [true, "Team shorthand is required"]
    },
    titles: {
        type: Number,
        default: 0
    },
    homeVenue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Venue", //! Check this again
        default: null
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
        default: null
    } //! Here in future we can add coach field also if we want to 
}, { timestamps: true });

export default mongoose.model("Team", teamSchema);