import mongoose from "mongoose";

const { Schema } = mongoose;

const playerSchema = new Schema({
    name: {
        type: String,
        trim: true,
        minlength: 10,
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
        minlength: 10,
        maxlength: 50,
        required: [true, "Nationality is required"]
    },
    role: {
        type: String,
        trim: true,
        minlength: 10,
        maxlength: 30,
        required: [true, "Role is required"]
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"  //! check this again
    }
}, { timestamps: true });

export default mongoose.model("Player", playerSchema);