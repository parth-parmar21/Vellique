import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    contact: {
        type: String,
        required: false // in work
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId
        }
    },
    fullName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["buyer", "seller"],
        default: "buyer"
    },
    googleId: {
        type: String
    }
})

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("user", userSchema)

