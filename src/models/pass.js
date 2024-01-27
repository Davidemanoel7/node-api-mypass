require('dotenv').config();

const mongoose = require('mongoose');

const passSchema = mongoose.Schema({
    url: {
        required: false,
        type: String
    },
    description: {
        required: true,
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    modified: {
        type: Number,
        required: false,
    }
})

module.exports = mongoose.model('Pass', passSchema);
