import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        minlength: 10,
        maxlength: 100,
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
        required: [true, "Password is required"],
        minlength: 8,
        select: false //this will prevent from bydefault selecting this data
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
}, { timestamps: true });

//here we hash pass before saving in mongodb and the isModified function checks that is the password field modified while updating new data if not modifired then return otherwise hash password and store it in db this works as middlware
userSchema.pre("save", async function () {
    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.method.comparePassword = async function (rawPass) {
    return await bcrypt.compare(rawPass, this.password);
}

export default mongoose.model("User", userSchema);