import mongoose from "mongoose";

const checkboxSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },

    checked: {
        type: Boolean,
        default: false
    }
});

export default mongoose.model("Checkbox", checkboxSchema);
