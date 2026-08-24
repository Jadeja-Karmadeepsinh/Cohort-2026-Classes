import mongoose from "mongoose";

const { Schema } = mongoose;

const teamSponsorSchema = new Schema({
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: [true, "Team is required"]
    },
    sponsor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sponsor",
        required: [true, "Sponsor is required"]
    }
}, { timestamps: true });

//! Unique index so that one team dont have duplicate sponsor 
teamSponsorSchema.index(
    { team: 1, sponsor: 1 },
    { unique: true }
)

export default mongoose.model("TeamSponsor", teamSponsorSchema);