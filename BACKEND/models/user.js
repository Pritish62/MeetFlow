import mongoose, { model, Schema } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    }, 
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,

    },
    token: {
        type: String
    }
})

const User = mongoose.model("User" , userSchema);

export {User};