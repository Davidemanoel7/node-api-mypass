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
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
        required: true,
        type: String
    },
    profileImage: {
        required: false,
        type: String
    },
    living: {
        type: Boolean,
        default: true
    },
    userType: {
        type: String,
        required: false,
        default: 'common'
    }
});

module.exports = mongoose.model('User', userSchema)