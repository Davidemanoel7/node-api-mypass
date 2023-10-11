const mongoose = require('mongoose');
const User = require('../models/users');
const { ObjectId } = require('mongodb');

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
    userId: {
        type: ObjectId,
        ref: User,
        required: true // => Necessário?? Testar um POST sem informar este campo e ver o efeito colateral...
    }
})

module.exports = mongoose.model('Pass', passSchema)