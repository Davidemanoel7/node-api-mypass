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
    // userId deve ser mesmo string??
    // https://www.youtube.com/watch?v=CMDsTMV2AgI&list=PL55RiY5tL51q4D-B63KBnygU6opNPFk_q&index=8
    userId: {
        type: ObjectId,
        ref: User
    }
})

module.exports = mongoose.model('Pass', passSchema)