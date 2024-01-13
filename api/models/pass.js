const mongoose = require('mongoose');
const User = require('../models/users');
const { ObjectId } = require('mongodb');

const passSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url: {
        required: false,
        type: String
    },
    description: {
        required: false,
        type: String
    },
    password: {
        required: true,
        type: String
    },
    cryptKey: {
        required: true,
        type: String
    },
    userId: {
        type: ObjectId,
        ref: User,
        required: true
    }
})

module.exports = mongoose.model('Pass', passSchema)