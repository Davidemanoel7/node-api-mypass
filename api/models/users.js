const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        required: true,
        type: String,
    },
    user: {
        unique: true,
        required: true,
        type: String,
    },
    email: {
        unique: true,
        required: true,
        type: String,
    },
    password: {
        required: true,
        type: String
    },
    profileImage: {
        required: false,
        type: String
    }
});

module.exports = mongoose.model('User', userSchema)