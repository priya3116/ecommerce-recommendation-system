const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String
    },
    city: {
        type: String
    },
    age: {
        type: Number
    },
    registration_date: {
        type: Date
    }
});

module.exports = mongoose.model("User", userSchema);