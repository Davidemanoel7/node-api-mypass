const mongoose = require('mongoose');
const User = require('../models/users');

const passSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    description: {
        required: false,
        type: String
    },
    password: {
        required: true,
        type: String
    },
    // userId deve ser mesmo string??
    userId: {
        type: String,
        ref: User
    }
})

module.exports = mongoose.model('Pass', passSchema)