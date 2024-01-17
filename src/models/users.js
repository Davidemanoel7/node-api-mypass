const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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

// Hash de senha antes de salvar no DB...
userSchema.pre('save', async function(next) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash( this.password, salt);
        this.password = hashedPass;
        next();
    } catch(error) {
        next(error);
    }
});

module.exports = mongoose.model('User', userSchema)